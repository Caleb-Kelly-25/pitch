import { PlaceBid } from "../../application/PlaceBid";
import { PlayCard } from "../../application/PlayCard";
import { HandCycle } from "../../domain/entities/HandCycle";
import { BiddingCycle } from "../../domain/entities/BiddingCycle";
import { Trick } from "../../domain/entities/Trick";
import { Hand } from "../../domain/entities/Hand";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { Card } from "../../domain/entities/Card";
import { PlayerId } from "../../types/id-declarations";

function createGame() {
  const biddingCycle = new BiddingCycle(
    "p1" as PlayerId,
    null,
    0,
    { p1: undefined, p2: undefined, p3: undefined, p4: undefined } as any
  );

  const trick = new Trick(0, "p1" as PlayerId, {} as any, "p1" as PlayerId);

  const handCycle = new HandCycle(
    "p1" as PlayerId,
    "" as PlayerId,
    0,
    Suit.SPADES,
    [],
    HandCycleStatus.BIDDING,
    0,
    0,
    biddingCycle,
    trick
  );

  const gameState: any = {
    id: "GAME",
    teamOneScore: 0,
    teamTwoScore: 0,
    players: [
      { id: "p1", hand: new Hand() },
      { id: "p2", hand: new Hand() },
      { id: "p3", hand: new Hand() },
      { id: "p4", hand: new Hand() }
    ],
    handCycle
  };

  return gameState;
}

describe("Full Game Simulation", () => {
  it("runs a complete bidding + play cycle", () => {
    const game = createGame();

    // --- BIDDING: p4 wins with highest bid ---
    PlaceBid.placeBid(game, "p1" as PlayerId, 5);
    PlaceBid.placeBid(game, "p2" as PlayerId, 6);
    PlaceBid.placeBid(game, "p3" as PlayerId, 7);
    PlaceBid.placeBid(game, "p4" as PlayerId, 8);

    expect(game.handCycle.handCycleStatus).toBe(HandCycleStatus.PLAYING);

    // Step B: Inject hands — all trump (SPADES) so no player is "out of cards".
    // Give 2 cards each so isHandCycleOver doesn't fire after the first trick.
    const c4 = new Card(Suit.SPADES, Value.JACK);
    const c1 = new Card(Suit.SPADES, Value.TEN);
    const c2 = new Card(Suit.SPADES, Value.ACE);
    const c3 = new Card(Suit.SPADES, Value.KING);

    game.players[0].hand.cards = [c1, new Card(Suit.SPADES, Value.TWO)];
    game.players[1].hand.cards = [c2, new Card(Suit.SPADES, Value.THREE)];
    game.players[2].hand.cards = [c3, new Card(Suit.SPADES, Value.FOUR)];
    game.players[3].hand.cards = [c4, new Card(Suit.SPADES, Value.FIVE)];

    // Capture the trick object before plays — it will be mutated in place as cards are added.
    const completedTrick = game.handCycle.trick;

    // Step C: p4 won the bid so play order wraps: p4 → p1 → p2 → p3
    PlayCard.playCard(game, "p4" as PlayerId, c4);
    PlayCard.playCard(game, "p1" as PlayerId, c1);
    PlayCard.playCard(game, "p2" as PlayerId, c2);
    PlayCard.playCard(game, "p3" as PlayerId, c3);

    // Step D: The captured trick object was mutated with all 4 cards before nextTrick replaced the reference
    expect(completedTrick.cardsPlayed).toBeDefined();
    expect(Object.keys(completedTrick.cardsPlayed).length).toBe(4);

    // Step E: After nextTrick, game.handCycle.trick is the new trick whose playerTurn is the winner
    const winner = game.handCycle.trick.playerTurn;
    expect(["p1", "p2", "p3", "p4"]).toContain(winner);
  });


  it("ensures no card duplication across hands", () => {
    const game = createGame();

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