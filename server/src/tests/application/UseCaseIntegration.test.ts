/**
 * Integration tests that exercise multiple use-case functions together
 * (placeBid → pickSuit → playCard) using in-memory state only.
 */
import { placeBid } from "../../application/PlaceBid";
import { pickSuit } from "../../application/PickSuit";
import { playCard } from "../../application/PlayCard";
import GameState from "../../domain/entities/GameState";
import {
    BiddingHand,
    PlayingHand,
    TrumpSelectHand,
    createWaitingHand,
    startBidding,
} from "../../domain/entities/HandCycle";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

// ── helpers ───────────────────────────────────────────────────────────────────

// Dealer = p1 (index 0) → bidding order: p2, p3, p4, p1
// Each player gets one SPADES card so the blind-cards phase is skipped
// (blindCards = [] in startBidding → currentBlindCard = null in startBlindCards).
function makeGame(): GameState {
    const configs: [PlayerId, Value][] = [
        ["p1" as PlayerId, Value.FOUR],  // team one, plays 4th
        ["p2" as PlayerId, Value.ACE],   // team two, bid winner, plays 1st
        ["p3" as PlayerId, Value.TWO],   // team one, plays 2nd
        ["p4" as PlayerId, Value.THREE], // team two, plays 3rd
    ];
    const players = configs.map(([id, v], i) =>
        new Player(id, id, id as unknown as UserId, new Hand([new Card(Suit.SPADES, v)]), false, true, false, 0, i + 1)
    );
    const handCycle = startBidding(createWaitingHand("p1" as PlayerId), players);
    return new GameState("g1" as GameId, players, "g1", handCycle, 0, 0);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("Full Use Case Integration", () => {
    it("bidding → trump selection: transitions correctly and records the bid winner", () => {
        const game = makeGame();
        // Bidding order: p2, p3, p4, p1
        placeBid(game, "p2" as PlayerId, 4);
        placeBid(game, "p3" as PlayerId, 0);
        placeBid(game, "p4" as PlayerId, 0);
        placeBid(game, "p1" as PlayerId, 0);

        expect(game.handCycle.phase).toBe("trumpselection");
        const ts = game.handCycle as TrumpSelectHand;
        expect(ts.bidWinnerId).toBe("p2");
        expect(ts.bidAmount).toBe(4);
    });

    it("trump selection → playing: skips blind-cards phase when blind deck is empty", () => {
        const game = makeGame();
        placeBid(game, "p2" as PlayerId, 4);
        placeBid(game, "p3" as PlayerId, 0);
        placeBid(game, "p4" as PlayerId, 0);
        placeBid(game, "p1" as PlayerId, 0);

        pickSuit(game, "p2" as PlayerId, Suit.SPADES);

        expect(game.handCycle.phase).toBe("playing");
        const ph = game.handCycle as PlayingHand;
        expect(ph.trumpSuit).toBe(Suit.SPADES);
        expect(ph.bidWinnerId).toBe("p2");
        expect(ph.trick.playerTurn).toBe("p2"); // bid winner leads
    });

    it("playing → hand scored: bid winner earns points when they make their bid", () => {
        const game = makeGame();
        placeBid(game, "p2" as PlayerId, 4);
        placeBid(game, "p3" as PlayerId, 0);
        placeBid(game, "p4" as PlayerId, 0);
        placeBid(game, "p1" as PlayerId, 0);
        pickSuit(game, "p2" as PlayerId, Suit.SPADES);

        // Play order: p2, p3, p4, p1 (bid winner leads)
        // Cards: ACE(p2), TWO(p3), THREE(p4), FOUR(p1)
        // ACE wins → p2 (index 1, team two)
        // TWO played by p3 (index 2, team one) → Two rule: 1 pt → team one
        // ACE(1)+THREE(3) → team two; TWO(1) → team one; FOUR(0) → 0
        // teamTwoHandPoints=4 ≥ bid(4) → teamTwoScore += 4; teamOneScore += 1
        playCard(game, "p2" as PlayerId, new Card(Suit.SPADES, Value.ACE));
        playCard(game, "p3" as PlayerId, new Card(Suit.SPADES, Value.TWO));
        playCard(game, "p4" as PlayerId, new Card(Suit.SPADES, Value.THREE));
        playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.FOUR));

        expect(game.teamTwoScore).toBe(4);
        expect(game.teamOneScore).toBe(1);
        expect(game.handCycle.phase).toBe("bidding"); // game not over → new hand
    });

    it("game transitions to 'complete' when the bid team reaches the win threshold", () => {
        const game = makeGame();
        game.teamTwoScore = 50; // 50 + 5 = 55 ≥ 52

        placeBid(game, "p2" as PlayerId, 4);
        placeBid(game, "p3" as PlayerId, 0);
        placeBid(game, "p4" as PlayerId, 0);
        placeBid(game, "p1" as PlayerId, 0);
        pickSuit(game, "p2" as PlayerId, Suit.SPADES);

        playCard(game, "p2" as PlayerId, new Card(Suit.SPADES, Value.ACE));
        playCard(game, "p3" as PlayerId, new Card(Suit.SPADES, Value.TWO));
        playCard(game, "p4" as PlayerId, new Card(Suit.SPADES, Value.THREE));
        playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.FOUR));

        // teamTwoHandPoints=4 ≥ bid(4) → teamTwoScore = 50 + 4 = 54 ≥ 52 → complete
        expect(game.handCycle.phase).toBe("complete");
        expect(game.teamTwoScore).toBe(54);
    });

    it("no card appears in more than one player's hand", () => {
        const game = makeGame();
        const seen = new Set<string>();
        for (const p of game.players) {
            for (const c of p.hand.cards) {
                const key = `${c.suit}-${c.value}`;
                expect(seen.has(key)).toBe(false);
                seen.add(key);
            }
        }
    });
});
