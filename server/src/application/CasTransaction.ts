import GameState from "../domain/entities/GameState";
import IGameStateRepository from "../domain/repositories/IGameStateRepository";
import { ConcurrencyConflictError, GameNotFoundError } from "../domain/errors/GameErrors";

export const MAX_ATTEMPTS = 5;

/**
 * Runs a state transition under optimistic concurrency control.
 *
 * Reads the game, applies `apply` to it, and commits with a compare-and-swap
 * against the version it read. If another writer committed in between, the read
 * and the mutation are both redone against fresh state — the previously
 * proposed state is discarded, because it was derived from data that is now
 * known to be stale.
 *
 * `apply` may return a callback, which runs only if the transition commits.
 * Use it for side effects that must not fire for an attempt that lost the race.
 *
 * Errors thrown by `apply` (invalid move, wrong phase) are terminal and
 * propagate immediately — a losing move does not become legal on retry.
 */
export async function withGameState(
    repo: IGameStateRepository,
    gameId: string,
    apply: (gameState: GameState) => (() => void) | void,
): Promise<GameState> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const gameState = await repo.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        const expectedVersion = gameState.version;
        const onCommitted = apply(gameState);
        gameState.version = expectedVersion + 1;

        if (await repo.updateGameState(gameId, expectedVersion, gameState)) {
            onCommitted?.();
            return gameState;
        }

        console.warn(`[CAS] conflict on game ${gameId}, attempt ${attempt}/${MAX_ATTEMPTS}`);
    }

    throw new ConcurrencyConflictError(gameId, MAX_ATTEMPTS);
}
