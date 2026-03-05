import GameState from "../../domain/entities/GameState";
import IShortTermStoragePort from "../../ports/IShortTermStoragePort";
import { pubClient } from "../../bootstrap";

export class RedisShortTermAdapter implements IShortTermStoragePort {
    // TODO: will fill one by one

    async createGameState(state: GameState): Promise<void> {
        try {
            const key = state.id; // Use the game state ID as the Redis key

            const value = JSON.stringify(state); // Convert the game state object to a JSON string for storage

            await pubClient.set(key, value, {
                EX: 3600, // Set expiration time to 1 hour (3600 seconds)
            });
        } catch (error) {
            console.error(`[RedisAdapter] Error creating game ${state.id}:`, error);
        }
    }

    async getGameStateById(id: string): Promise<GameState | null> {
        try {
            const data = await pubClient.get(id); 
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
            await pubClient.del(id); // Delete the game state from Redis using the key
        } catch (error) {
            console.error(`[RedisAdapter] Error deleting game ${id}:`, error);
        }
    }

    async getAllGameStates(): Promise<GameState[]> {
        try{
            const keys = await pubClient.keys('*'); // Get all keys from Redis

            if (keys.length === 0) {
                return [];
            }

            const results = await pubClient.mGet(keys);

            return results
                .filter((data): data is string => data !== null)
                .map(data => JSON.parse(data) as GameState)
        } catch (error) {
            console.error(`[RedisAdapter] Error fetching all games:`, error);
            return []; // Fail gracefully by returning an empty array
        }
    }
}