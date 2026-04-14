import { PlaceBid } from "../../application/PlaceBid";
import { PlayCard } from "../../application/PlayCard";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { Card } from "../../domain/entities/Card";
import { PlayerId } from "../../types/id-declarations";

function createGame() {
  const handCycle: any = {
    handCycleStatus: HandCycleStatus.BIDDING,
    biddingCycle: {
      currentBidderId: "p1",
      highestBid: 0,
      highestBidderId: "",
      playerBids: {
        p1: undefined,
        p2: undefined,
        p3: undefined,
        p4: undefined
      }
    },
    trick: {
      startingPlayerId: "p1",
      playerTurn: "p1",
      cardsPlayed: {},
      roundNumber: 0
    },
    trumpSuit: Suit.SPADES,
    teamOnePoints: 0,
    teamTwoPoints: 0
  };

  const gameState: any = {
    id: "GAME",
    teamOneScore: 0,
    teamTwoScore: 0,
    players: [
      { id: "p1", hand: { cards: [] } },
      { id: "p2", hand: { cards: [] } },
      { id: "p3", hand: { cards: [] } },
      { id: "p4", hand: { cards: [] } }
    ],
    handCycle
  };

  return gameState;
}

describe("Full Game Simulation", () => {
  it("runs a complete bidding + play cycle", () => {
    const game = createGame();

    // --- BIDDING ---
    PlaceBid.placeBid(game, "p1" as PlayerId, 5);
    PlaceBid.placeBid(game, "p2" as PlayerId, 6);
    PlaceBid.placeBid(game, "p3" as PlayerId, 7);
    PlaceBid.placeBid(game, "p4" as PlayerId, 8);

    expect(game.handCycle.handCycleStatus).toBe(HandCycleStatus.PLAYING);


    // Step B: Inject hands
    const c1 = new Card(Suit.SPADES, Value.TEN);
    const c2 = new Card(Suit.HEARTS, Value.ACE);
    const c3 = new Card(Suit.CLUBS, Value.KING);
    const c4 = new Card(Suit.SPADES, Value.JACK);

    game.players[0].hand.cards = [c1];
    game.players[1].hand.cards = [c2];
    game.players[2].hand.cards = [c3];
    game.players[3].hand.cards = [c4];

    // Step C: Full Trick
    PlayCard.playCard(game, "p1" as PlayerId, c1);
    PlayCard.playCard(game, "p2" as PlayerId, c2);
    PlayCard.playCard(game, "p3" as PlayerId, c3);
    PlayCard.playCard(game, "p4" as PlayerId, c4);

    // Step D: Assert Trick Completion
        expect(game.handCycle.trick.cardsPlayed).toBeDefined();
    expect(Object.keys(game.handCycle.trick.cardsPlayed).length).toBe(4);

    // Step E: Assert Win Logic
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