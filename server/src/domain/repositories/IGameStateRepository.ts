import GameState from "../entities/GameState";

export default interface IGameStateRepository {
    getGameStateById(id: string): Promise<GameState | null>;
    createGameState(gameState: GameState): Promise<void>;
    getAllGameStates(): Promise<GameState[]>;
    deleteGameState(id: string): Promise<void>;
}