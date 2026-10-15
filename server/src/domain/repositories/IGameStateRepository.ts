import GameState from "../entities/GameState";

export default interface IGameStateRepository {
    getGameStateById(id: string): Promise<GameState | null>;
    createGameState(gameState: GameState): Promise<void>;
    getAllGameStates(): Promise<GameState[]>;
    deleteGameState(id: string): Promise<void>;
    /**
     * Compare-and-swap. Writes `newState` only if the stored state is still at
     * `expectedVersion`.
     *
     * @returns true if committed, false if another writer got there first
     *          (retryable — re-read and re-apply, never resubmit `newState`).
     * @throws  GameNotFoundError if the game no longer exists, or the
     *          underlying storage error on infrastructure failure. Both are
     *          terminal; neither should be retried as a conflict.
     */
    updateGameState(gameId: string, expectedVersion: number, newState: GameState): Promise<boolean>;
}