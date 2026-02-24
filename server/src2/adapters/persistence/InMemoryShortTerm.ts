import GameState from "../../domain/entities/GameState";
import { User } from "../../domain/entities/User";
import IShortTermStoragePort from "../../ports/IShortTermStoragePort";

export default class InMemoryShortTermStorageAdapter implements IShortTermStoragePort {

    private gameStates: Map<string, GameState> = new Map<string, GameState>();

    getGameStateById(id: string): Promise<GameState | null> {
        return Promise.resolve(this.gameStates.get(id) || null);
    }
    createGameState(state: GameState): Promise<void> {
        this.gameStates.set(state.id, state);
        return Promise.resolve();
    }
    getAllGameStates(): Promise<GameState[]> {
        return Promise.resolve(Array.from(this.gameStates.values()));
    }
    deleteGameState(id: string): Promise<void> {
        this.gameStates.delete(id);
        return Promise.resolve();
    }
    
    
}