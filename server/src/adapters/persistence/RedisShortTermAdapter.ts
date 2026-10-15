import GameState from "../../domain/entities/GameState";
import { GameNotFoundError } from "../../domain/errors/GameErrors";
import IShortTermStoragePort from "../../ports/IShortTermStoragePort";
import { GameId } from "../../types/id-declarations";
import { RedisClientType } from "redis";

const TTL_SECONDS = 3600;

/**
 * Compare-and-swap. Redis is single-threaded and runs a script to completion,
 * so the read-compare-write below cannot interleave with another writer.
 *
 * The caller stamps the new version onto the document before serializing it;
 * this script's only job is to confirm the transition was derived from the
 * version that is still stored. Keeping it a pure comparator avoids decoding
 * and re-encoding the whole game document on the Redis thread.
 *
 * Replies: 1 committed · 0 version mismatch · -1 key missing · -2 corrupt
 */
const CAS_SCRIPT = `
local stored = redis.call('GET', KEYS[1])
if not stored then return -1 end
local ok, doc = pcall(cjson.decode, stored)
if not ok then return -2 end
if tonumber(doc.version or 0) ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
return 1
`;

export class RedisShortTermAdapter implements IShortTermStoragePort {
    private redisClient: RedisClientType;

    constructor(redisClient: any) {
        this.redisClient = redisClient;
    }

    /**
     * Note: unlike the other methods here, this one does NOT swallow errors. A
     * caller distinguishes "someone beat me to it, retry" (false) from "this
     * action can never land" (throw), and a silently-swallowed Redis outage
     * reported as `false` would masquerade as a version conflict.
     */
    async updateGameState(gameId: string, expectedVersion: number, newState: GameState): Promise<boolean> {
        const value = JSON.stringify(newState);
        const reply = await this.redisClient.eval(CAS_SCRIPT, {
            keys: [gameId],
            arguments: [String(expectedVersion), value, String(TTL_SECONDS)],
        });

        switch (Number(reply)) {
            case 1: return true;
            case 0: return false;
            case -1: throw new GameNotFoundError(gameId);
            default:
                throw new Error(`[RedisAdapter] Stored game ${gameId} is not valid JSON`);
        }
    }

    async createGameState(state: GameState): Promise<void> {
        try {
            if (!state.id) {
                const id = crypto.randomUUID();
                state.id = id as GameId; // Ensure the game state has its ID set to the Redis key
            }
            state.version = 0; // Starting point for the compare-and-swap chain
            const value = JSON.stringify(state); // Convert the game state object to a JSON string for storage
            await this.redisClient.set(state.id, value, { EX: TTL_SECONDS });

        } catch (error) {
            console.error(`[RedisAdapter] Error creating game ${state.id}:`, error);
        }
    }

    async getGameStateById(id: string): Promise<GameState | null> {
        try {
            const data = await this.redisClient.get(id); 
            if (!data) {
                return null; // Return null if the game state is not found
            }
             // Parse the JSON string back into a GameState object
            return GameState.fromJSONObject(JSON.parse(data) as GameState);
        } catch (error) {
            console.error(`[RedisAdapter] Error getting game ${id}:`, error);
            return null; //Fail Gracefully
        }
    }

    async deleteGameState(id: string): Promise<void> {
        try{
            await this.redisClient.del(id); // Delete the game state from Redis using the key
        } catch (error) {
            console.error(`[RedisAdapter] Error deleting game ${id}:`, error);
        }
    }

    async getAllGameStates(): Promise<GameState[]> {
        try{
            const keys = await this.redisClient.keys('*'); // Get all keys from Redis

            if (keys.length === 0) {
                return [];
            }

            const results = await this.redisClient.mGet(keys);

            return results
                .filter((data): data is string => data !== null)
                .map(data => JSON.parse(data) as GameState)
        } catch (error) {
            console.error(`[RedisAdapter] Error fetching all games:`, error);
            return []; // Fail gracefully
        }
    }
}