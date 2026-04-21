import { discardHandCard } from "../../application/DiscardHandCard";
import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { BlindCardsHand } from "../../domain/entities/HandCycle";
import { WrongPhaseError, InvalidPlayError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, cards: Card[] = []): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(cards), false, true, false, 0, 1);
}

function makeBlindGame(bidWinnerCards: Card[] = [], bidWinnerId = "p1"): GameState {
    const players = [
        makePlayer("p1", bidWinnerId === "p1" ? bidWinnerCards : []),
        makePlayer("p2"),
        makePlayer("p3"),
        makePlayer("p4"),
    ];
    const hand: BlindCardsHand = {
        phase: "blindcards",
        dealerId: "p1" as PlayerId,
        bidWinnerId: bidWinnerId as PlayerId,
        bidAmount: 4,
        trumpSuit: Suit.HEARTS,
        blindCards: [],
        currentBlindCard: null,
    };
    return new GameState("g1" as GameId, players, "g1", hand, 0, 0);
}

describe("discardHandCard — phase validation", () => {
    it("throws WrongPhaseError when not in blindcards phase", () => {
        const game = makeBlindGame();
        (game as any).handCycle = { phase: "playing" };
        expect(() => discardHandCard(game, "p1" as PlayerId, Suit.HEARTS, Value.ACE)).toThrow(WrongPhaseError);
    });
});

describe("discardHandCard — authorization", () => {
    it("throws InvalidPlayError when called by a non-bid-winner", () => {
        const game = makeBlindGame([], "p1");
        expect(() => discardHandCard(game, "p2" as PlayerId, Suit.HEARTS, Value.ACE)).toThrow(InvalidPlayError);
    });
});

describe("discardHandCard — card removal", () => {
    it("removes the specified card from the bid winner's hand", () => {
        const card = new Card(Suit.HEARTS, Value.ACE);
        const game = makeBlindGame([card]);
        discardHandCard(game, "p1" as PlayerId, Suit.HEARTS, Value.ACE);
        expect(game.players[0].hand.hasCard(card)).toBe(false);
    });

    it("throws InvalidPlayError when the card is not in the hand", () => {
        const game = makeBlindGame([new Card(Suit.HEARTS, Value.TWO)]);
        expect(() => discardHandCard(game, "p1" as PlayerId, Suit.HEARTS, Value.KING)).toThrow(InvalidPlayError);
    });

    it("leaves other cards untouched", () => {
        const keep = new Card(Suit.HEARTS, Value.KING);
        const discard = new Card(Suit.HEARTS, Value.ACE);
        const game = makeBlindGame([keep, discard]);
        discardHandCard(game, "p1" as PlayerId, Suit.HEARTS, Value.ACE);
        expect(game.players[0].hand.hasCard(keep)).toBe(true);
        expect(game.players[0].hand.cards).toHaveLength(1);
    });
});
