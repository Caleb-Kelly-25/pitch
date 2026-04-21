import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { createWaitingHand } from "../../domain/entities/HandCycle";
import { PlayerId, UserId, GameId } from "../../types/id-declarations";

function makePlayer(id: string): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(), false, true, false, 0, 1);
}

describe("GameState constructor", () => {
    it("stores all fields", () => {
        const players = [makePlayer("p1"), makePlayer("p2")];
        const handCycle = createWaitingHand("p1" as PlayerId);
        const game = new GameState("g1" as GameId, players, "CODE", handCycle, 10, 20);

        expect(game.id).toBe("g1");
        expect(game.players).toHaveLength(2);
        expect(game.gameCode).toBe("CODE");
        expect(game.teamOneScore).toBe(10);
        expect(game.teamTwoScore).toBe(20);
        expect(game.handCycle).toBe(handCycle);
    });
});

describe("GameState.fromJSONObject", () => {
    it("reconstructs a GameState with nested Player and HandCycle from JSON", () => {
        const json: any = {
            id: "g1",
            gameCode: "CODE",
            teamOneScore: 5,
            teamTwoScore: 7,
            players: [
                { id: "p1", username: "alice", userId: "u1", hand: { cards: [] }, isDealer: false, isActive: true, isReady: false, score: 0, seat: 1 },
                { id: "p2", username: "bob",   userId: "u2", hand: { cards: [] }, isDealer: false, isActive: true, isReady: false, score: 0, seat: 2 },
            ],
            handCycle: { phase: "waiting", dealerId: "p1" },
        };

        const game = GameState.fromJSONObject(json);

        expect(game).toBeInstanceOf(GameState);
        expect(game.id).toBe("g1");
        expect(game.gameCode).toBe("CODE");
        expect(game.teamOneScore).toBe(5);
        expect(game.teamTwoScore).toBe(7);
        expect(game.players).toHaveLength(2);
        expect(game.players[0]).toBeInstanceOf(Player);
        expect(game.handCycle.phase).toBe("waiting");
        expect(game.handCycle.dealerId).toBe("p1");
    });

    it("round-trips through JSON serialization", () => {
        const players = [makePlayer("p1")];
        const handCycle = createWaitingHand("p1" as PlayerId);
        const original = new GameState("g1" as GameId, players, "CODE", handCycle, 3, 6);

        const json = JSON.parse(JSON.stringify(original));
        const restored = GameState.fromJSONObject(json);

        expect(restored.id).toBe(original.id);
        expect(restored.gameCode).toBe(original.gameCode);
        expect(restored.teamOneScore).toBe(original.teamOneScore);
        expect(restored.teamTwoScore).toBe(original.teamTwoScore);
        expect(restored.handCycle.phase).toBe("waiting");
    });
});
