import GameState from "../domain/entities/GameState";
import IGameStateRepository from "../domain/repositories/IGameStateRepository";

export default interface IShortTermStoragePort extends IGameStateRepository {
    // User methods
    getGameStateById(id: string): Promise<GameState | null>;
    createGameState(state: GameState): Promise<void>;
    getAllGameStates(): Promise<GameState[]>;
    deleteGameState(id: string): Promise<void>;
    updateGameState(gameState: GameState): Promise<void>;
}