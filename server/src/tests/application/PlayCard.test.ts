import { playCard } from "../../application/PlayCard";
import GameState from "../../domain/entities/GameState";
import { PlayingHand } from "../../domain/entities/HandCycle";
import { Trick } from "../../domain/entities/Trick";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { InvalidPlayError, WrongPhaseError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

const IDS = ["p1", "p2", "p3", "p4"] as PlayerId[];

function makePlayer(id: PlayerId, cards: Card[]): Player {
    return new Player(id, id, id as unknown as UserId, new Hand(cards), false, true, false, 0, IDS.indexOf(id) + 1);
}

function makeGame(opts: {
    bidWinner?: PlayerId;
    bidAmount?: number;
    trump?: Suit;
    cards?: Card[][];
    teamOneScore?: number;
    teamTwoScore?: number;
}): GameState {
    const {
        bidWinner = "p1" as PlayerId,
        bidAmount = 4,
        trump = Suit.SPADES,
        cards = [[], [], [], []],
        teamOneScore = 0,
        teamTwoScore = 0,
    } = opts;
    const players = IDS.map((id, i) => makePlayer(id, cards[i] ?? []));
    const trick = new Trick(0, bidWinner, {} as Record<PlayerId, Card | null>, bidWinner);
    const hand: PlayingHand = {
        phase: "playing",
        dealerId: "p1" as PlayerId,
        bidWinnerId: bidWinner,
        bidAmount,
        trumpSuit: trump,
        trick,
        teamOneHandPoints: 0,
        teamTwoHandPoints: 0,
    };
    return new GameState("g1" as GameId, players, "g1", hand, teamOneScore, teamTwoScore);
}

// Shorthand for a SPADES card
const s = (v: Value) => new Card(Suit.SPADES, v);

describe("playCard — phase and turn validation", () => {
    it("throws WrongPhaseError when not in playing phase", () => {
        const game = makeGame({ cards: [[s(Value.ACE)], [], [], []] });
        (game as any).handCycle = { phase: "bidding" };
        expect(() => playCard(game, "p1" as PlayerId, s(Value.ACE))).toThrow(WrongPhaseError);
    });

    it("throws InvalidPlayError when it is not the player's turn", () => {
        // Bid winner is p1, so p1 plays first; p2 playing is invalid
        const game = makeGame({ cards: [[], [s(Value.ACE)], [], []] });
        expect(() => playCard(game, "p2" as PlayerId, s(Value.ACE))).toThrow(InvalidPlayError);
    });

    it("throws InvalidPlayError when the card is not in the player's hand", () => {
        const game = makeGame({ cards: [[s(Value.TEN)], [], [], []] });
        expect(() => playCard(game, "p1" as PlayerId, s(Value.ACE))).toThrow(InvalidPlayError);
    });

    it("throws InvalidPlayError when player plays a non-trump card while holding trump", () => {
        const game = makeGame({ cards: [[s(Value.ACE)], [], [], []] });
        const nonTrump = new Card(Suit.HEARTS, Value.KING);
        expect(() => playCard(game, "p1" as PlayerId, nonTrump)).toThrow(InvalidPlayError);
    });
});

describe("playCard — auto-pass when out of trump", () => {
    it("records null in cardsPlayed and advances turn when the player has no trump", () => {
        const game = makeGame({
            cards: [
                [new Card(Suit.HEARTS, Value.TEN)], // p1: no spades
                [s(Value.ACE)], [s(Value.TWO)], [s(Value.THREE)],
            ],
        });
        playCard(game, "p1" as PlayerId, new Card(Suit.HEARTS, Value.TEN));
        const hand = game.handCycle as PlayingHand;
        expect(hand.trick.cardsPlayed["p1" as PlayerId]).toBeNull();
        expect(hand.trick.playerTurn).toBe("p2");
    });

    it("chains auto-passes for consecutive out-of-trump players", () => {
        // p1 and p2 have no trump; p3 has trump
        const game = makeGame({
            cards: [
                [new Card(Suit.HEARTS, Value.TEN)],
                [new Card(Suit.HEARTS, Value.KING)],
                [s(Value.ACE)],
                [s(Value.TWO)],
            ],
        });
        playCard(game, "p1" as PlayerId, new Card(Suit.HEARTS, Value.TEN));
        const hand = game.handCycle as PlayingHand;
        // p1 auto-passed, then p2 auto-passed, turn lands on p3
        expect(hand.trick.cardsPlayed["p1" as PlayerId]).toBeNull();
        expect(hand.trick.cardsPlayed["p2" as PlayerId]).toBeNull();
        expect(hand.trick.playerTurn).toBe("p3");
    });
});

describe("playCard — card play mechanics", () => {
    it("removes the card from the player's hand and records it in the trick", () => {
        // p1 has 2 cards so the hand doesn't end after one play
        const game = makeGame({ cards: [[s(Value.TEN), s(Value.TWO)], [s(Value.ACE)], [s(Value.KING)], [s(Value.QUEEN)]] });
        playCard(game, "p1" as PlayerId, s(Value.TEN));
        expect(game.players[0].hand.cards).toHaveLength(1); // TEN removed, TWO remains
        const hand = game.handCycle as PlayingHand;
        expect(hand.trick.cardsPlayed["p1" as PlayerId]).toBeTruthy();
    });

    it("advances to a new trick (roundNumber increments) after all 4 players play", () => {
        const game = makeGame({
            cards: [
                [s(Value.TEN), s(Value.TWO)],
                [s(Value.ACE), s(Value.THREE)],
                [s(Value.KING), s(Value.FOUR)],
                [s(Value.QUEEN), s(Value.FIVE)],
            ],
        });
        playCard(game, "p1" as PlayerId, s(Value.TEN));
        playCard(game, "p2" as PlayerId, s(Value.ACE));
        playCard(game, "p3" as PlayerId, s(Value.KING));
        playCard(game, "p4" as PlayerId, s(Value.QUEEN));
        const hand = game.handCycle as PlayingHand;
        expect(hand.trick.roundNumber).toBe(1);
    });

    it("awards trick points to the correct team (p1 wins ACE trick → team one)", () => {
        // ACE(1) + TWO(1) + THREE(3) + FOUR(0) = 5 pts; p1 (index 0, team one) wins with ACE
        const game = makeGame({
            cards: [[s(Value.ACE)], [s(Value.TWO)], [s(Value.THREE)], [s(Value.FOUR)]],
        });
        playCard(game, "p1" as PlayerId, s(Value.ACE));
        playCard(game, "p2" as PlayerId, s(Value.TWO));
        playCard(game, "p3" as PlayerId, s(Value.THREE));
        playCard(game, "p4" as PlayerId, s(Value.FOUR));
        // Hand ends (all out of trump); bid made (5 ≥ 4); teamOneScore += 5
        expect(game.teamOneScore).toBe(5);
        expect(game.teamTwoScore).toBe(0);
    });

    it("subtracts the bid from the team's score when they fail to make their bid", () => {
        // p1 (team one, bid winner) bids 8 but earns only ACE(1) = 1 pt
        const game = makeGame({
            bidAmount: 8,
            cards: [[s(Value.ACE)], [s(Value.FOUR)], [s(Value.FIVE)], [s(Value.SIX)]],
        });
        playCard(game, "p1" as PlayerId, s(Value.ACE));
        playCard(game, "p2" as PlayerId, s(Value.FOUR));
        playCard(game, "p3" as PlayerId, s(Value.FIVE));
        playCard(game, "p4" as PlayerId, s(Value.SIX));
        expect(game.teamOneScore).toBe(-8);
    });

    it("resets to a new bidding hand when the hand ends and the game is not over", () => {
        const game = makeGame({
            teamOneScore: 30,
            cards: [[s(Value.ACE)], [s(Value.TWO)], [s(Value.THREE)], [s(Value.FOUR)]],
        });
        playCard(game, "p1" as PlayerId, s(Value.ACE));
        playCard(game, "p2" as PlayerId, s(Value.TWO));
        playCard(game, "p3" as PlayerId, s(Value.THREE));
        playCard(game, "p4" as PlayerId, s(Value.FOUR));
        // teamOneScore = 30 + 5 = 35 < 52 → new hand
        expect(game.handCycle.phase).toBe("bidding");
    });

    it("transitions to 'complete' when the bidding team reaches 52 points", () => {
        // p1 (team one) starts at 50; earns 5 pts → 55 ≥ 52 and made bid (5 ≥ 4)
        const game = makeGame({
            teamOneScore: 50,
            cards: [[s(Value.ACE)], [s(Value.TWO)], [s(Value.THREE)], [s(Value.FOUR)]],
        });
        playCard(game, "p1" as PlayerId, s(Value.ACE));
        playCard(game, "p2" as PlayerId, s(Value.TWO));
        playCard(game, "p3" as PlayerId, s(Value.THREE));
        playCard(game, "p4" as PlayerId, s(Value.FOUR));
        expect(game.handCycle.phase).toBe("complete");
    });

    it("JOKER beats non-ACE trump cards", () => {
        const game = makeGame({
            cards: [
                [new Card(Suit.HEARTS, Value.JOKER)], // p1: JOKER
                [s(Value.KING)], [s(Value.QUEEN)], [s(Value.JACK)],
            ],
        });
        // p1 has no spades (trump), so auto-passes — JOKER is trump via isCardTrump
        // Actually JOKER is treated as trump: isCardTrump checks value === JOKER
        // But hasSuit(SPADES) uses the JOKER rule too, so p1 is NOT out of trump
        // p1 plays JOKER (non-spades but joker counts as trump)
        playCard(game, "p1" as PlayerId, new Card(Suit.HEARTS, Value.JOKER));
        playCard(game, "p2" as PlayerId, s(Value.KING));
        playCard(game, "p3" as PlayerId, s(Value.QUEEN));
        playCard(game, "p4" as PlayerId, s(Value.JACK));
        // After trick: JOKER wins vs KING, QUEEN, JACK
        // All players out of trump → hand ends
        // p1 (team one) wins; JOKER(1)+KING(0)+QUEEN(0)+JACK(1) = 2 pts
        // 2 < bid(4) → teamOneScore = -4
        expect(game.teamOneScore).toBe(-4);
    });
});
