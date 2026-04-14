import { HandCycle } from "../../domain/entities/HandCycle";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";

describe("HandCycle.canPlayCard", () => {
  it("returns false if not in PLAYING state", () => {
    const cycle = new HandCycle(
      "p1" as any,
      "p2" as any,
      0,
      Suit.HEARTS,
      [],
      HandCycleStatus.BIDDING,
      0,
      0,
      {} as any
    );

    const card = new Card(Suit.HEARTS, Value.ACE);

    expect(cycle.canPlayCard(card)).toBe(false);
  });

  it("rejects non-trump, non-joker, non-jick cards", () => {
    const cycle = new HandCycle(
        "p1" as any,
        "p2" as any,
        0,
        Suit.SPADES,
        [],
        HandCycleStatus.PLAYING,
        0,
        0,
        {} as any
    );

    const card = new Card(Suit.HEARTS, Value.TEN);

    expect(cycle.canPlayCard(card)).toBe(false);
  });

  it("allows trump suit cards", () => {
    const cycle = new HandCycle(
        "p1" as any,
        "p2" as any,
        0,
        Suit.SPADES,
        [],
        HandCycleStatus.PLAYING,
        0,
        0,
        {} as any
    );

    const card = new Card(Suit.SPADES, Value.TEN);

    expect(cycle.canPlayCard(card)).toBe(true);
  });

  it("allows joker cards", () => {
    const cycle = new HandCycle(
        "p1" as any,
        "p2" as any,
        0,
        Suit.HEARTS,
        [],
        HandCycleStatus.PLAYING,
        0,
        0,
        {} as any
    );

    const joker = new Card(Suit.CLUBS, Value.JOKER);

    expect(cycle.canPlayCard(joker)).toBe(true);
  });

  it("allows jick cards", () => {
    const cycle = new HandCycle(
        "p1" as any,
        "p2" as any,
        0,
        Suit.HEARTS,
        [],
        HandCycleStatus.PLAYING,
        0,
        0,
        {} as any
    );

    const jick = Card.jick(Suit.HEARTS);

    expect(cycle.canPlayCard(jick)).toBe(true);
    });


});


describe("HandCycle.fromJSONObject", () => {
  it("reconstructs HandCycle and nested cards/trick", () => {
    const json: any = {
      dealerId: "p1",
      bidWinner: "p2",
      bidAmount: 10,
      trumpSuit: Suit.SPADES,
      blindCards: [
        { suit: Suit.HEARTS, value: Value.ACE }
      ],
      handCycleStatus: HandCycleStatus.PLAYING,
      teamOnePoints: 3,
      teamTwoPoints: 5,
      trick: {
        roundNumber: 1,
        startingPlayerId: "p1",
        playerTurn: "p2",
        cardsPlayed: {}
      }
    };

    const cycle = HandCycle.fromJSONObject(json);

    expect(cycle.dealerId).toBe("p1");
    expect(cycle.bidAmount).toBe(10);
    expect(cycle.trumpSuit).toBe(Suit.SPADES);

    expect(cycle.blindCards[0]).toBeInstanceOf(Card);
    expect(cycle.blindCards[0].value).toBe(Value.ACE);

    expect(cycle.trick).toBeDefined();
  });
});
