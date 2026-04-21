import { processBlindCard } from "../../application/BlindCard";
import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { BlindCardsHand, PlayingHand } from "../../domain/entities/HandCycle";
import { WrongPhaseError, InvalidPlayError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

function makePlayer(id: string, cards: Card[] = []): Player {
    return new Player(id as PlayerId, id, id as unknown as UserId, new Hand(cards), false, true, false, 0, 1);
}

function makeBlindGame(opts: {
    bidWinnerId?: string;
    bidWinnerCards?: Card[];
    blindCards?: Card[];
    currentBlindCard?: Card | null;
} = {}): GameState {
    const {
        bidWinnerId = "p1",
        bidWinnerCards = [],
        blindCards = [],
        currentBlindCard = new Card(Suit.HEARTS, Value.ACE),
    } = opts;
    const players = [
        makePlayer("p1", bidWinnerId === "p1" ? bidWinnerCards : []),
        makePlayer("p2", bidWinnerId === "p2" ? bidWinnerCards : []),
        makePlayer("p3"),
        makePlayer("p4"),
    ];
    const hand: BlindCardsHand = {
        phase: "blindcards",
        dealerId: "p1" as PlayerId,
        bidWinnerId: bidWinnerId as PlayerId,
        bidAmount: 4,
        trumpSuit: Suit.HEARTS,
        blindCards,
        currentBlindCard,
    };
    return new GameState("g1" as GameId, players, "g1", hand, 0, 0);
}

describe("processBlindCard — phase validation", () => {
    it("throws WrongPhaseError when not in blindcards phase", () => {
        const game = makeBlindGame();
        (game as any).handCycle = { phase: "playing" };
        expect(() => processBlindCard(game, "p1" as PlayerId, "keep")).toThrow(WrongPhaseError);
    });
});

describe("processBlindCard — authorization", () => {
    it("throws InvalidPlayError when non-bid-winner interacts", () => {
        const game = makeBlindGame({ bidWinnerId: "p1" });
        expect(() => processBlindCard(game, "p2" as PlayerId, "keep")).toThrow(InvalidPlayError);
    });

    it("throws InvalidPlayError when there is no current blind card", () => {
        const game = makeBlindGame({ currentBlindCard: null });
        expect(() => processBlindCard(game, "p1" as PlayerId, "keep")).toThrow(InvalidPlayError);
    });
});

describe("processBlindCard — keep", () => {
    it("adds the blind card to the bid winner's hand", () => {
        const game = makeBlindGame({ bidWinnerCards: [] });
        processBlindCard(game, "p1" as PlayerId, "keep");
        expect(game.players[0].hand.cards).toHaveLength(1);
    });

    it("throws when hand is already full (≥6 cards)", () => {
        const cards = Array.from({ length: 6 }, (_, i) => new Card(Suit.HEARTS, Value.TWO));
        const game = makeBlindGame({ bidWinnerCards: cards });
        expect(() => processBlindCard(game, "p1" as PlayerId, "keep")).toThrow(InvalidPlayError);
    });

    it("advances to playing when no more blind cards remain after keeping", () => {
        const game = makeBlindGame({ blindCards: [], currentBlindCard: new Card(Suit.HEARTS, Value.ACE) });
        processBlindCard(game, "p1" as PlayerId, "keep");
        expect(game.handCycle.phase).toBe("playing");
    });
});

describe("processBlindCard — discard", () => {
    it("does not add the card to the hand on discard", () => {
        const game = makeBlindGame({ bidWinnerCards: [] });
        processBlindCard(game, "p1" as PlayerId, "discard");
        expect(game.players[0].hand.cards).toHaveLength(0);
    });

    it("advances to playing when blind deck is exhausted", () => {
        const game = makeBlindGame({ blindCards: [] });
        processBlindCard(game, "p1" as PlayerId, "discard");
        expect(game.handCycle.phase).toBe("playing");
    });
});

describe("processBlindCard — swap", () => {
    it("replaces a hand card with the blind card", () => {
        const handCard = new Card(Suit.HEARTS, Value.TWO);
        const game = makeBlindGame({
            bidWinnerCards: [handCard],
            currentBlindCard: new Card(Suit.HEARTS, Value.ACE),
        });
        processBlindCard(game, "p1" as PlayerId, "swap", Suit.HEARTS, Value.TWO);
        const hand = game.players[0].hand;
        expect(hand.hasCard(handCard)).toBe(false);
        expect(hand.hasCard(new Card(Suit.HEARTS, Value.ACE))).toBe(true);
    });

    it("throws when the card to swap is not in the hand", () => {
        const game = makeBlindGame({ bidWinnerCards: [] });
        expect(() =>
            processBlindCard(game, "p1" as PlayerId, "swap", Suit.HEARTS, Value.KING)
        ).toThrow(InvalidPlayError);
    });

    it("throws when swap parameters are missing", () => {
        const game = makeBlindGame({ bidWinnerCards: [new Card(Suit.HEARTS, Value.TWO)] });
        expect(() => processBlindCard(game, "p1" as PlayerId, "swap")).toThrow(InvalidPlayError);
    });
});
