import {
    createWaitingHand,
    startBidding,
    startTrumpSelection,
    startBlindCards,
    startPlayingFromBlindCards,
    completeHand,
    handCycleFromJSON,
    BiddingHand,
    TrumpSelectHand,
    BlindCardsHand,
    PlayingHand,
} from "../../domain/entities/HandCycle";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { Trick } from "../../domain/entities/Trick";
import { PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, seat: number, cards: Card[] = []): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(cards), false, true, false, 0, seat);
}

describe("createWaitingHand", () => {
    it("creates a waiting hand with the given dealer", () => {
        const hand = createWaitingHand("p1" as PlayerId);
        expect(hand.phase).toBe("waiting");
        expect(hand.dealerId).toBe("p1");
    });
});

describe("startBidding", () => {
    it("sets phase to bidding and orders players starting after the dealer", () => {
        const players = ["p1", "p2", "p3", "p4"].map((id, i) => makePlayer(id, i + 1));
        const waiting = createWaitingHand("p1" as PlayerId);
        const hand = startBidding(waiting, players) as BiddingHand;

        expect(hand.phase).toBe("bidding");
        expect(hand.biddingCycle.currentBidderId).toBe("p2"); // p1 is dealer, p2 bids first
    });

    it("initialises all player bids as undefined", () => {
        const players = ["p1", "p2"].map((id, i) => makePlayer(id, i + 1));
        const hand = startBidding(createWaitingHand("p1" as PlayerId), players) as BiddingHand;

        for (const bid of Object.values(hand.biddingCycle.playerBids)) {
            expect(bid).toBeUndefined();
        }
    });
});

describe("startTrumpSelection", () => {
    it("throws when no bid winner exists", () => {
        const players = ["p1", "p2"].map((id, i) => makePlayer(id, i + 1));
        const hand = startBidding(createWaitingHand("p1" as PlayerId), players) as BiddingHand;
        // No bids placed → highestBidderId is null
        expect(() => startTrumpSelection(hand)).toThrow("Bidding ended with no winner");
    });

    it("transitions to trumpselection with the correct winner and bid amount", () => {
        const players = ["p1", "p2"].map((id, i) => makePlayer(id, i + 1));
        const hand = startBidding(createWaitingHand("p1" as PlayerId), players) as BiddingHand;
        hand.biddingCycle.highestBidderId = "p2" as PlayerId;
        hand.biddingCycle.highestBid = 5;

        const ts = startTrumpSelection(hand) as TrumpSelectHand;
        expect(ts.phase).toBe("trumpselection");
        expect(ts.bidWinnerId).toBe("p2");
        expect(ts.bidAmount).toBe(5);
    });
});

describe("startBlindCards", () => {
    it("filters non-trump cards from all players' hands", () => {
        const spadeCard = new Card(Suit.SPADES, Value.ACE);
        const heartCard = new Card(Suit.HEARTS, Value.TEN);
        const players = [
            makePlayer("p1", 1, [spadeCard, heartCard]),
            makePlayer("p2", 2, [heartCard]),
        ];
        const ts: TrumpSelectHand = {
            phase: "trumpselection",
            dealerId: "p1" as PlayerId,
            bidWinnerId: "p1" as PlayerId,
            bidAmount: 4,
            blindCards: [],
        };

        startBlindCards(ts, Suit.SPADES, players);

        expect(players[0].hand.cards).toHaveLength(1);
        expect(players[0].hand.cards[0].suit).toBe(Suit.SPADES);
        expect(players[1].hand.cards).toHaveLength(0);
    });

    it("sets currentBlindCard to null when blind deck is empty", () => {
        const players = ["p1", "p2"].map((id, i) => makePlayer(id, i + 1));
        const ts: TrumpSelectHand = {
            phase: "trumpselection",
            dealerId: "p1" as PlayerId,
            bidWinnerId: "p1" as PlayerId,
            bidAmount: 4,
            blindCards: [],
        };

        const bch = startBlindCards(ts, Suit.SPADES, players) as BlindCardsHand;
        expect(bch.currentBlindCard).toBeNull();
    });
});

describe("startPlayingFromBlindCards", () => {
    it("transitions to playing with bid winner leading the first trick", () => {
        const bch: BlindCardsHand = {
            phase: "blindcards",
            dealerId: "p1" as PlayerId,
            bidWinnerId: "p2" as PlayerId,
            bidAmount: 4,
            trumpSuit: Suit.HEARTS,
            blindCards: [],
            currentBlindCard: null,
        };

        const ph = startPlayingFromBlindCards(bch) as PlayingHand;
        expect(ph.phase).toBe("playing");
        expect(ph.trumpSuit).toBe(Suit.HEARTS);
        expect(ph.trick.playerTurn).toBe("p2");
        expect(ph.teamOneHandPoints).toBe(0);
        expect(ph.teamTwoHandPoints).toBe(0);
    });
});

describe("completeHand", () => {
    it("captures final points into a complete hand", () => {
        const trick = new Trick(0, "p1" as PlayerId, {} as any, "p1" as PlayerId);
        const ph: PlayingHand = {
            phase: "playing",
            dealerId: "p1" as PlayerId,
            bidWinnerId: "p2" as PlayerId,
            bidAmount: 4,
            trumpSuit: Suit.SPADES,
            trick,
            teamOneHandPoints: 3,
            teamTwoHandPoints: 7,
        };

        const ch = completeHand(ph);
        expect(ch.phase).toBe("complete");
        expect(ch.teamOneHandPoints).toBe(3);
        expect(ch.teamTwoHandPoints).toBe(7);
    });
});

describe("handCycleFromJSON", () => {
    it("rebuilds a waiting hand", () => {
        const h = handCycleFromJSON({ phase: "waiting", dealerId: "p1" });
        expect(h.phase).toBe("waiting");
        expect(h.dealerId).toBe("p1");
    });

    it("rebuilds a bidding hand with BiddingCycle", () => {
        const json: any = {
            phase: "bidding",
            dealerId: "p1",
            blindCards: [],
            biddingCycle: { currentBidderId: "p2", highestBidderId: null, highestBid: 0, playerBids: {} },
        };
        const h = handCycleFromJSON(json) as BiddingHand;
        expect(h.phase).toBe("bidding");
        expect(h.biddingCycle.currentBidderId).toBe("p2");
    });

    it("rebuilds a playing hand with Trick instance", () => {
        const json: any = {
            phase: "playing",
            dealerId: "p1",
            bidWinnerId: "p2",
            bidAmount: 4,
            trumpSuit: Suit.HEARTS,
            trick: { roundNumber: 1, startingPlayerId: "p2", cardsPlayed: {}, playerTurn: "p3" },
            teamOneHandPoints: 2,
            teamTwoHandPoints: 5,
        };
        const h = handCycleFromJSON(json) as PlayingHand;
        expect(h.phase).toBe("playing");
        expect(h.trick).toBeInstanceOf(Trick);
        expect(h.trick.roundNumber).toBe(1);
    });

    it("throws for an unknown phase", () => {
        expect(() => handCycleFromJSON({ phase: "unknown" })).toThrow();
    });
});
