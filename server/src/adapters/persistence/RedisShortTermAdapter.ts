import GameState from "../../domain/entities/GameState";
import IShortTermStoragePort from "../../ports/IShortTermStoragePort";
import { GameId } from "../../types/id-declarations";
import { v4 as uuidv4 } from 'uuid';
import { RedisClientType } from "redis";

export class RedisShortTermAdapter implements IShortTermStoragePort {
    private redisClient: RedisClientType;

    constructor(redisClient: RedisClientType) {
        this.redisClient = redisClient;
    }

    async createGameState(state: GameState): Promise<void> {
        try {
            const id = uuidv4(); // Use the game state ID as the Redis key
            state.id = id as GameId; // Ensure the game state has its ID set to the Redis key
            
            const value = JSON.stringify(state); // Convert the game state object to a JSON string for storage
            await this.redisClient.set(id, value, { EX: 3600 });

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
            return JSON.parse(data) as GameState; // Parse the JSON string back into a GameState object
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