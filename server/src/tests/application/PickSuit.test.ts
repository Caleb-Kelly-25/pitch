import { pickSuit } from "../../application/PickSuit";
import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { TrumpSelectHand, BlindCardsHand, PlayingHand } from "../../domain/entities/HandCycle";
import { WrongPhaseError, InvalidPlayError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, cards: Card[] = []): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(cards), false, true, false, 0, 1);
}

function makeTrumpSelectGame(bidWinnerId = "p1", blindCards: Card[] = []): GameState {
    const players = ["p1", "p2", "p3", "p4"].map(id => makePlayer(id));
    const hand: TrumpSelectHand = {
        phase: "trumpselection",
        dealerId: "p1" as PlayerId,
        bidWinnerId: bidWinnerId as PlayerId,
        bidAmount: 4,
        blindCards,
    };
    return new GameState("g1" as GameId, players, "g1", hand, 0, 0);
}

describe("pickSuit — phase validation", () => {
    it("throws WrongPhaseError when not in trumpselection phase", () => {
        const game = makeTrumpSelectGame();
        (game as any).handCycle = { phase: "bidding" };
        expect(() => pickSuit(game, "p1" as PlayerId, Suit.SPADES)).toThrow(WrongPhaseError);
    });
});

describe("pickSuit — authorization", () => {
    it("throws InvalidPlayError when a non-bid-winner tries to pick the suit", () => {
        const game = makeTrumpSelectGame("p1");
        expect(() => pickSuit(game, "p2" as PlayerId, Suit.SPADES)).toThrow(InvalidPlayError);
    });
});

describe("pickSuit — transitions", () => {
    it("skips blind cards and goes straight to playing when blind deck is empty", () => {
        const game = makeTrumpSelectGame("p1", []); // no blind cards
        pickSuit(game, "p1" as PlayerId, Suit.HEARTS);
        expect(game.handCycle.phase).toBe("playing");
        const ph = game.handCycle as PlayingHand;
        expect(ph.trumpSuit).toBe(Suit.HEARTS);
    });

    it("transitions to blindcards when blind cards remain after filling non-bid-winners", () => {
        // p2, p3, p4 each get 5 hearts so they each need only 1 blind card to reach 6
        // 3 blind cards → non-bid-winners, 4th → bid winner's currentBlindCard
        const heartValues = [Value.TWO, Value.THREE, Value.FOUR, Value.FIVE, Value.SIX];
        const blindCards = [Value.SEVEN, Value.EIGHT, Value.NINE, Value.TEN].map(v => new Card(Suit.HEARTS, v));
        const game = makeTrumpSelectGame("p1", blindCards);
        for (let i = 1; i <= 3; i++) {
            game.players[i].hand.cards = heartValues.map(v => new Card(Suit.HEARTS, v));
        }
        pickSuit(game, "p1" as PlayerId, Suit.HEARTS);
        expect(game.handCycle.phase).toBe("blindcards");
        const bch = game.handCycle as BlindCardsHand;
        expect(bch.trumpSuit).toBe(Suit.HEARTS);
        expect(bch.currentBlindCard).not.toBeNull();
    });

    it("strips non-trump cards from all players when picking suit", () => {
        const spade = new Card(Suit.SPADES, Value.ACE);
        const heart = new Card(Suit.HEARTS, Value.TEN);
        const game = makeTrumpSelectGame("p1", []);
        game.players[0].hand.addCard(spade);
        game.players[0].hand.addCard(heart);

        pickSuit(game, "p1" as PlayerId, Suit.SPADES);

        // Only spades should remain
        expect(game.players[0].hand.cards.every(c => c.suit === Suit.SPADES)).toBe(true);
    });
});
