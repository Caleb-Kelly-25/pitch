import { RoomService } from "../../application/RoomService";
import { BiddingHand, createWaitingHand } from "../../domain/entities/HandCycle";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, seat: number): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(), false, true, false, 0, seat);
}

// ── createRoom ────────────────────────────────────────────────────────────────

describe("RoomService.createRoom", () => {
    it("creates a new game state and stores it with the game code as id", async () => {
        const userRepo = { findById: jest.fn().mockResolvedValue({ username: "alice" }) };
        const storage = { createGameState: jest.fn(), getGameStateById: jest.fn(), updateGameState: jest.fn() };
        const publisher = { publishGameStateToRoom: jest.fn() };

        const service = new RoomService(storage as any, userRepo as any, publisher as any);
        await service.createRoom("GAME1", "u1");

        expect(storage.createGameState).toHaveBeenCalledTimes(1);
        const created = storage.createGameState.mock.calls[0][0];
        expect(created.id).toBe("GAME1");
        expect(created.players).toHaveLength(1);
    });

    it("throws if the user does not exist", async () => {
        const userRepo = { findById: jest.fn().mockResolvedValue(null) };
        const storage = { createGameState: jest.fn() };
        const publisher = { publishGameStateToRoom: jest.fn() };

        const service = new RoomService(storage as any, userRepo as any, publisher as any);
        await expect(service.createRoom("GAME1", "ghost")).rejects.toThrow("User not found");
    });
});

// ── joinRoom ──────────────────────────────────────────────────────────────────

describe("RoomService.joinRoom", () => {
    it("adds a new player to an existing room and publishes updated state", async () => {
        const room = {
            id: "G1",
            players: [makePlayer("u1", 1)],
            handCycle: createWaitingHand("u1" as PlayerId),
        };
        const userRepo = { findById: jest.fn().mockResolvedValue({ username: "bob" }) };
        const storage = { getGameStateById: jest.fn().mockResolvedValue(room), updateGameState: jest.fn() };
        const publisher = { publishGameStateToRoom: jest.fn() };

        const service = new RoomService(storage as any, userRepo as any, publisher as any);
        await service.joinRoom("G1", "u2");

        expect(room.players).toHaveLength(2);
        expect(storage.updateGameState).toHaveBeenCalledWith(room);
        expect(publisher.publishGameStateToRoom).toHaveBeenCalledWith("G1", room);
    });

    it("throws when the room does not exist", async () => {
        const service = new RoomService(
            { getGameStateById: jest.fn().mockResolvedValue(null) } as any,
            {} as any,
            {} as any,
        );
        await expect(service.joinRoom("NOPE", "u1")).rejects.toThrow("Room not found");
    });

    it("throws when the room is already full", async () => {
        const fullRoom = {
            players: ["u1", "u2", "u3", "u4"].map((id, i) => makePlayer(id, i + 1)),
        };
        const service = new RoomService(
            { getGameStateById: jest.fn().mockResolvedValue(fullRoom) } as any,
            {} as any,
            {} as any,
        );
        await expect(service.joinRoom("G1", "u5")).rejects.toThrow("Room is full");
    });

    it("re-broadcasts state for a reconnecting player without adding a duplicate", async () => {
        const room = {
            id: "G1",
            players: [makePlayer("u1", 1)],
            handCycle: createWaitingHand("u1" as PlayerId),
        };
        const storage = { getGameStateById: jest.fn().mockResolvedValue(room), updateGameState: jest.fn() };
        const publisher = { publishGameStateToRoom: jest.fn() };

        const service = new RoomService(storage as any, {} as any, publisher as any);
        await service.joinRoom("G1", "u1"); // u1 is already in the room

        expect(room.players).toHaveLength(1); // no duplicate
        expect(publisher.publishGameStateToRoom).toHaveBeenCalled();
    });

    it("starts the game when the 4th player joins: deals 9 cards each and enters bidding", async () => {
        const players = ["u1", "u2", "u3"].map((id, i) => makePlayer(id, i + 1));
        const room: any = {
            id: "G1",
            players,
            handCycle: createWaitingHand("u1" as PlayerId),
        };
        const userRepo = { findById: jest.fn().mockResolvedValue({ username: "u4" }) };
        const storage = { getGameStateById: jest.fn().mockResolvedValue(room), updateGameState: jest.fn() };
        const publisher = { publishGameStateToRoom: jest.fn() };

        const service = new RoomService(storage as any, userRepo as any, publisher as any);
        await service.joinRoom("G1", "u4");

        expect(room.players).toHaveLength(4);
        for (const p of room.players) {
            expect(p.hand.cards).toHaveLength(9);
        }
        const hand = room.handCycle as BiddingHand;
        expect(hand.phase).toBe("bidding");
        expect(hand.blindCards).toHaveLength(54 - 36); // 18 blind cards remain
    });
});
