import GameState from "../domain/entities/GameState";

export default interface IShortTermStoragePort {
    // User methods
    getGameStateById(id: string): Promise<GameState | null>;
    createGameState(state: GameState): Promise<void>;
    getAllGameStates(): Promise<GameState[]>;
    deleteGameState(id: string): Promise<void>;
}