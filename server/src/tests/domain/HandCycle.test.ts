import { HandCycle } from "../../domain/entities/HandCycle";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { Card } from "../../domain/entities/Card";
import { Player } from "../../domain/entities/Player";
import { PlayerId } from "../../types/id-declarations";

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
      null,
      null
    );

    const card = new Card(Suit.HEARTS, Value.ACE);

    expect(cycle.canPlayCard(card)).toBe(false);
  });

  it("allows trump card in PLAYING state", () => {
    const cycle = new HandCycle(
      "p1" as any,
      "p2" as any,
      0,
      Suit.SPADES,
      [],
      HandCycleStatus.PLAYING,
      0,
      0,
      null,
      {} as any
    );

    const card = new Card(Suit.SPADES, Value.TEN);

    expect(cycle.canPlayCard(card)).toBe(true);
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
      null,
      {} as any
    );

    const card = new Card(Suit.HEARTS, Value.TEN);

    expect(cycle.canPlayCard(card)).toBe(false);
  });
});

describe("HandCycle.startBidding", () => {
  it("initializes bidding cycle in correct order", () => {
    const players = [
      new Player("p1" as any, "A", "u1" as any, {} as any, false, false, false, 0, 0),
      new Player("p2" as any, "B", "u2" as any, {} as any, false, false, false, 0, 0),
      new Player("p3" as any, "C", "u3" as any, {} as any, false, false, false, 0, 0),
      new Player("p4" as any, "D", "u4" as any, {} as any, false, false, false, 0, 0),
    ];

    const cycle = new HandCycle(
      "p2" as any, // dealer
      "" as any,
      0,
      Suit.HEARTS,
      [],
      HandCycleStatus.WAITING,
      0,
      0,
      null,
      null
    );

    cycle.startBidding(players);

    expect(cycle.biddingCycle).not.toBeNull();
    expect(cycle.biddingCycle!.currentBidderId).toBe("p3"); // after dealer
    expect(Object.keys(cycle.biddingCycle!.playerBids).length).toBe(4);
  });

  it("sets all player bids to undefined initially", () => {
    const players = [
      new Player("p1" as any, "A", "u1" as any, {} as any, false, false, false, 0, 0),
      new Player("p2" as any, "B", "u2" as any, {} as any, false, false, false, 0, 0),
    ];

    const cycle = new HandCycle(
      "p1" as any,
      "" as any,
      0,
      Suit.HEARTS,
      [],
      HandCycleStatus.WAITING,
      0,
      0,
      null,
      null
    );

    cycle.startBidding(players);

    expect(cycle.biddingCycle!.playerBids["p1" as PlayerId]).toBeUndefined();
    expect(cycle.biddingCycle!.playerBids["p2" as PlayerId]).toBeUndefined();
  });
});

describe("HandCycle.nextStatus", () => {
  it("transitions WAITING → BIDDING", () => {
    const cycle = new HandCycle(
      "p1" as any,
      "" as any,
      0,
      Suit.HEARTS,
      [],
      HandCycleStatus.WAITING,
      0,
      0,
      null,
      null
    );

    const gameState = {
      players: [
        { id: "p1" },
        { id: "p2" }
      ]
    } as any;

    cycle.nextStatus(gameState);

    expect(cycle.handCycleStatus).toBe(HandCycleStatus.BIDDING);
    expect(cycle.biddingCycle).not.toBeNull();
  });

  it("transitions BIDDING → PLAYING", () => {
    const cycle = new HandCycle(
        "p1" as any,
        "" as any,
        0,
        Suit.HEARTS,
        [],
        HandCycleStatus.BIDDING,
        0,
        0,
        {
        highestBidderId: "p2",
        highestBid: 10
        } as any,
        null
    );

    cycle.nextStatus({} as any);

    expect(cycle.handCycleStatus).toBe(HandCycleStatus.PLAYING);
    expect(cycle.trick).not.toBeNull();
    expect(cycle.bidWinner).toBe("p2");
    expect(cycle.bidAmount).toBe(10);
  });

    it("transitions PLAYING → COMPLETE when score threshold reached", () => {
        const cycle = new HandCycle(
            "p1" as any,
            "p2" as any,
            0,
            Suit.HEARTS,
            [],
            HandCycleStatus.PLAYING,
            52,
            10,
            null,
            {} as any
        );

        cycle.nextStatus({} as any);

        expect(cycle.handCycleStatus).toBe(HandCycleStatus.COMPLETE);
    });
});



describe("HandCycle.fromJSONObject", () => {
  it("rebuilds full nested structure", () => {
    const json: any = {
      dealerId: "p1",
      bidWinner: "p2",
      bidAmount: 10,
      trumpSuit: Suit.SPADES,
      blindCards: [
        { suit: Suit.HEARTS, value: Value.ACE }
      ],
      handCycleStatus: HandCycleStatus.PLAYING,
      teamOnePoints: 5,
      teamTwoPoints: 3,
      biddingCycle: null,
      trick: {
        roundNumber: 1,
        startingPlayerId: "p1",
        playerTurn: "p2",
        cardsPlayed: {}
      }
    };

    const cycle = HandCycle.fromJSONObject(json);

    expect(cycle).toBeInstanceOf(HandCycle);
    expect(cycle.blindCards[0]).toBeInstanceOf(Card);
    expect(cycle.trick).not.toBeNull();
  });
});