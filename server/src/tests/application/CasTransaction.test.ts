import { withGameState, MAX_ATTEMPTS } from "../../application/CasTransaction";
import { RoomService } from "../../application/RoomService";
import InMemoryShortTermStorageAdapter from "../../adapters/persistence/InMemoryShortTerm";
import GameState from "../../domain/entities/GameState";
import { createWaitingHand } from "../../domain/entities/HandCycle";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { ConcurrencyConflictError, GameNotFoundError, InvalidPlayError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, seat: number): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(), false, true, false, 0, seat);
}

function makeGame(id = "G1", playerCount = 1): GameState {
    const players = Array.from({ length: playerCount }, (_, i) => makePlayer(`p${i + 1}`, i + 1));
    return new GameState(id as GameId, players, id, createWaitingHand(players[0].id), 0, 0);
}

async function seededStorage(game: GameState) {
    const storage = new InMemoryShortTermStorageAdapter();
    await storage.createGameState(game);
    return storage;
}

// Commits a competing write the first `times` that the wrapped repo is asked
// to update, so the caller's CAS loses the race exactly that many times.
function withInterference(storage: InMemoryShortTermStorageAdapter, times: number) {
    let remaining = times;
    const realUpdate = storage.updateGameState.bind(storage);
    jest.spyOn(storage, "updateGameState").mockImplementation(async (id, expected, next) => {
        if (remaining > 0) {
            remaining--;
            const rival = (await storage.getGameStateById(id))!;
            const rivalVersion = rival.version;
            rival.teamTwoScore += 100;
            rival.version = rivalVersion + 1;
            await realUpdate(id, rivalVersion, rival);
        }
        return realUpdate(id, expected, next);
    });
}

describe("withGameState", () => {
    it("commits and bumps the version by exactly one", async () => {
        const storage = await seededStorage(makeGame());

        const result = await withGameState(storage, "G1", gs => { gs.teamOneScore = 5; });

        expect(result.version).toBe(1);
        const stored = (await storage.getGameStateById("G1"))!;
        expect(stored.teamOneScore).toBe(5);
        expect(stored.version).toBe(1);
    });

    it("re-reads and re-applies on conflict, so the rival write is not clobbered", async () => {
        const storage = await seededStorage(makeGame());
        withInterference(storage, 2);
        const apply = jest.fn((gs: GameState) => { gs.teamOneScore += 1; });

        await withGameState(storage, "G1", apply);

        expect(apply).toHaveBeenCalledTimes(3);
        const stored = (await storage.getGameStateById("G1"))!;
        expect(stored.teamOneScore).toBe(1);   // applied once, not three times
        expect(stored.teamTwoScore).toBe(200); // both rival writes survived
        expect(stored.version).toBe(3);
    });

    it("runs the commit callback only once, for the attempt that won", async () => {
        const storage = await seededStorage(makeGame());
        withInterference(storage, 2);
        const onCommitted = jest.fn();

        await withGameState(storage, "G1", () => onCommitted);

        expect(onCommitted).toHaveBeenCalledTimes(1);
    });

    it("gives up with ConcurrencyConflictError after MAX_ATTEMPTS losses", async () => {
        const storage = await seededStorage(makeGame());
        withInterference(storage, MAX_ATTEMPTS);
        const onCommitted = jest.fn();
        jest.spyOn(console, "warn").mockImplementation(() => {});

        await expect(withGameState(storage, "G1", gs => { gs.teamOneScore += 1; return onCommitted; }))
            .rejects.toThrow(ConcurrencyConflictError);

        expect(onCommitted).not.toHaveBeenCalled();
        expect((await storage.getGameStateById("G1"))!.teamOneScore).toBe(0);
    });

    it("does not retry when apply throws a domain error", async () => {
        const storage = await seededStorage(makeGame());
        const apply = jest.fn(() => { throw new InvalidPlayError("nope"); });

        await expect(withGameState(storage, "G1", apply)).rejects.toThrow(InvalidPlayError);

        expect(apply).toHaveBeenCalledTimes(1);
        expect((await storage.getGameStateById("G1"))!.version).toBe(0);
    });

    it("throws GameNotFoundError for a missing game", async () => {
        const storage = new InMemoryShortTermStorageAdapter();
        await expect(withGameState(storage, "nope", () => {})).rejects.toThrow(GameNotFoundError);
    });

    it("serializes many concurrent writers without losing any update", async () => {
        const storage = await seededStorage(makeGame());
        jest.spyOn(console, "warn").mockImplementation(() => {});

        await Promise.all(Array.from({ length: MAX_ATTEMPTS }, () =>
            withGameState(storage, "G1", gs => { gs.teamOneScore += 1; })
        ));

        const stored = (await storage.getGameStateById("G1"))!;
        expect(stored.teamOneScore).toBe(MAX_ATTEMPTS);
        expect(stored.version).toBe(MAX_ATTEMPTS);
    });
});

describe("RoomService under concurrent joins", () => {
    afterEach(() => jest.restoreAllMocks());

    it("seats exactly one of two players racing for the last seat", async () => {
        const storage = await seededStorage(makeGame("G1", 3));
        const userRepo = { findById: jest.fn(async (id: string) => ({ username: id })) };
        const publisher = { publishGameStateToRoom: jest.fn() };
        const service = new RoomService(storage, userRepo as any, publisher as any);
        jest.spyOn(console, "warn").mockImplementation(() => {});

        const results = await Promise.allSettled([
            service.joinRoom("G1", "late1"),
            service.joinRoom("G1", "late2"),
        ]);

        expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
        const rejected = results.find(r => r.status === "rejected") as PromiseRejectedResult;
        expect(rejected.reason.message).toBe("Room is full");
        expect((await storage.getGameStateById("G1"))!.players).toHaveLength(4);
    });

    it("seats a double-clicked join only once", async () => {
        const storage = await seededStorage(makeGame("G1", 1));
        const userRepo = { findById: jest.fn(async (id: string) => ({ username: id })) };
        const publisher = { publishGameStateToRoom: jest.fn() };
        const service = new RoomService(storage, userRepo as any, publisher as any);
        jest.spyOn(console, "warn").mockImplementation(() => {});

        await Promise.all([service.joinRoom("G1", "bob"), service.joinRoom("G1", "bob")]);

        const players = (await storage.getGameStateById("G1"))!.players;
        expect(players.filter(p => p.id === "bob")).toHaveLength(1);
    });
});
