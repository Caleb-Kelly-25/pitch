import { Trick } from "../../domain/entities/Trick";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { PlayerId } from "../../types/id-declarations";

describe("Trick constructor", () => {
  it("assigns all fields correctly", () => {
    const card = new Card(Suit.HEARTS, Value.ACE);

    const p1id = "p1" as PlayerId;
    const p2id = "p2" as PlayerId;

    const trick = new Trick(
      1,
      p1id,
      { [p1id]: card, [p2id]: null },
      p2id
    );

    expect(trick.roundNumber).toBe(1);
    expect(trick.startingPlayerId).toBe("p1");
    expect(trick.playerTurn).toBe("p2");
    expect(trick.cardsPlayed["p1" as PlayerId]).toBe(card);
    expect(trick.cardsPlayed["p2" as PlayerId]).toBeNull();
  });
});

describe("Trick.fromJSONObject", () => {
  it("reconstructs Trick with Card instances", () => {
    const json: any = {
      roundNumber: 2,
      startingPlayerId: "p1",
      playerTurn: "p3",
      cardsPlayed: {
        p1: { suit: Suit.HEARTS, value: Value.ACE },
        p2: null
      }
    };

    const trick = Trick.fromJSONObject(json);

    expect(trick).toBeInstanceOf(Trick);

    // basic fields
    expect(trick.roundNumber).toBe(2);
    expect(trick.startingPlayerId).toBe("p1");
    expect(trick.playerTurn).toBe("p3");

    // card reconstruction
    expect(trick.cardsPlayed["p1" as PlayerId]).toBeInstanceOf(Card);
    expect(trick.cardsPlayed["p1" as PlayerId]!.suit).toBe(Suit.HEARTS);
    expect(trick.cardsPlayed["p1" as PlayerId]!.value).toBe(Value.ACE);

    // null preservation
    expect(trick.cardsPlayed["p2" as PlayerId]).toBeNull();
  });
});

describe("Trick.fromJSONObject edge cases", () => {
  it("handles missing cardsPlayed gracefully", () => {
    const json: any = {
      roundNumber: 1,
      startingPlayerId: "p1",
      playerTurn: "p2"
    };

    const trick = Trick.fromJSONObject(json);

    expect(trick.cardsPlayed).toEqual({});
  });

  it("handles empty object", () => {
    const trick = Trick.fromJSONObject({});

    expect(trick.roundNumber).toBeUndefined();
    expect(trick.cardsPlayed).toEqual({});
  });
});

