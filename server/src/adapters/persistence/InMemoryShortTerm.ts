import GameState from "../../domain/entities/GameState";
import { GameNotFoundError } from "../../domain/errors/GameErrors";
import IShortTermStoragePort from "../../ports/IShortTermStoragePort";


// In-memory implementation of the short-term storage port for testing and development purposes.
//
// States are held serialized rather than by reference, mirroring Redis. This is
// not incidental: handing callers a live reference to stored state would let a
// mutation land before its compare-and-swap commits, and a retry would then
// apply the same transition twice. Serializing gives every read a fresh object
// graph, exactly as RedisShortTermAdapter does via fromJSONObject.
export default class InMemoryShortTermStorageAdapter implements IShortTermStoragePort {

    private gameStates: Map<string, string> = new Map<string, string>();

    getGameStateById(id: string): Promise<GameState | null> {
        const data = this.gameStates.get(id);
        if (!data) {
            return Promise.resolve(null);
        }
        return Promise.resolve(GameState.fromJSONObject(JSON.parse(data)));
    }
    createGameState(state: GameState): Promise<void> {
        state.version = 0; // Starting point for the compare-and-swap chain
        this.gameStates.set(state.id, JSON.stringify(state));
        return Promise.resolve();
    }
    getAllGameStates(): Promise<GameState[]> {
        return Promise.resolve(
            Array.from(this.gameStates.values()).map(data => GameState.fromJSONObject(JSON.parse(data)))
        );
    }
    deleteGameState(id: string): Promise<void> {
        this.gameStates.delete(id);
        return Promise.resolve();
    }
    updateGameState(gameId: string, expectedVersion: number, newState: GameState): Promise<boolean> {
        const data = this.gameStates.get(gameId);
        if (!data) {
            return Promise.reject(new GameNotFoundError(gameId));
        }
        if ((JSON.parse(data).version ?? 0) !== expectedVersion) {
            return Promise.resolve(false);
        }
        this.gameStates.set(gameId, JSON.stringify(newState));
        return Promise.resolve(true);
    }

}
