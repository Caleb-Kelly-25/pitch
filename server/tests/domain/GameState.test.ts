import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { HandCycle } from "../../domain/entities/HandCycle";
import { Suit } from "../../domain/enums/Suit";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";

describe("GameState constructor", () => {
  it("should assign all fields correctly", () => {
    const players = [
      { id: "p1" },
      { id: "p2" }
    ] as Player[];

    const handCycle = {
      dealerId: "p1"
    } as HandCycle;

    const game = new GameState(
      "game1" as any,
      players,
      "CODE123",
      handCycle,
      10,
      20
    );

    expect(game.id).toBe("game1");
    expect(game.players.length).toBe(2);
    expect(game.gameCode).toBe("CODE123");
    expect(game.teamOneScore).toBe(10);
    expect(game.teamTwoScore).toBe(20);
    expect(game.handCycle).toBe(handCycle);
  });
});

describe("GameState.fromJSONObject", () => {
  it("should reconstruct GameState with nested objects", () => {
    const json: any = {
      id: "game1",
      gameCode: "CODE123",
      teamOneScore: 5,
      teamTwoScore: 7,
      players: [
        {
          id: "p1",
          username: "Alice"
        },
        {
          id: "p2",
          username: "Bob"
        }
      ],
      handCycle: {
        dealerId: "p1",
        trumpSuit: Suit.HEARTS,
        handCycleStatus: HandCycleStatus.BIDDING
      }
    };

    const result = GameState.fromJSONObject(json);

    expect(result).toBeInstanceOf(GameState);

    // top-level fields
    expect(result.id).toBe("game1");
    expect(result.gameCode).toBe("CODE123");
    expect(result.teamOneScore).toBe(5);
    expect(result.teamTwoScore).toBe(7);

    // nested Player conversion
    expect(result.players.length).toBe(2);
    expect(result.players[0]).toBeInstanceOf(Player);
    expect(result.players[0].id).toBe("p1");

    // nested HandCycle conversion
    expect(result.handCycle).toBeInstanceOf(HandCycle);
    expect(result.handCycle.dealerId).toBe("p1");
    expect(result.handCycle.handCycleStatus).toBe(HandCycleStatus.BIDDING);
    expect(result.handCycle.trumpSuit).toBe(Suit.HEARTS);
  });
});

it("should preserve structure after serialization cycle", () => {
  const original = new GameState(
    "game1" as any,
    [] as any,
    "CODE",
    {} as any,
    1,
    2
  );

  const json = JSON.parse(JSON.stringify(original));
  const restored = GameState.fromJSONObject(json);

  expect(restored.id).toBe(original.id);
  expect(restored.gameCode).toBe(original.gameCode);
  expect(restored.teamOneScore).toBe(original.teamOneScore);
  expect(restored.teamTwoScore).toBe(original.teamTwoScore);
  expect(restored.players.length).toBe(original.players.length);
  expect(restored.handCycle).toBeInstanceOf(HandCycle);
  expect(restored.handCycle.dealerId).toBe(original.handCycle.dealerId);
  expect(restored.handCycle.handCycleStatus).toBe(original.handCycle.handCycleStatus);
  expect(restored.handCycle.trumpSuit).toBe(original.handCycle.trumpSuit);
});