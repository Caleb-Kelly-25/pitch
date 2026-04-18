import { describe, it, expect } from "@jest/globals";

import { PlayCard } from "../../application/PlayCard";
import { Card } from "../../domain/entities/Card";
import { Hand } from "../../domain/entities/Hand";
import { HandCycle } from "../../domain/entities/HandCycle";
import { Trick } from "../../domain/entities/Trick";
import { Player } from "../../domain/entities/Player";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { PlayerId } from "../../types/id-declarations";

function createPlayingState(bidWinner: string = "p1", bidAmount: number = 8, trumpSuit: Suit = Suit.SPADES): any {
  const trick = new Trick(0, bidWinner as PlayerId, {} as any, bidWinner as PlayerId);
  const handCycle = new HandCycle(
    "p1" as PlayerId,
    bidWinner as PlayerId,
    bidAmount,
    trumpSuit,
    [],
    HandCycleStatus.PLAYING,
    0,
    0,
    null,
    trick
  );
  return {
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
}

describe("PlayCard.validateTurn", () => {
  it("returns true when it's the player's turn", () => {
    const gameState: any = {
      handCycle: {
        trick: {
          playerTurn: "p1"
        }
      }
    };

    expect(PlayCard.validateTurn(gameState, "p1" as PlayerId)).toBe(true);
  });

  it("returns false when it's not the player's turn", () => {
    const gameState: any = {
      handCycle: {
        trick: {
          playerTurn: "p2"
        }
      }
    };

    expect(PlayCard.validateTurn(gameState, "p1" as PlayerId)).toBe(false);
  });
});

describe("PlayCard.getNextPlayerId", () => {
  const players = [
    { id: "p1" },
    { id: "p2" },
    { id: "p3" },
    { id: "p4" }
  ] as Player[];

  it("returns next player in order", () => {
    expect(PlayCard.getNextPlayerId("p1", players, "p1")).toBe("p2");
  });

  it("wraps around to first player", () => {
    expect(PlayCard.getNextPlayerId("p4", players, "p1")).toBe("p1");
  });
});

describe("PlayCard.compareCards", () => {
  it("ACE beats non-ACE", () => {
    const ace = new Card(Suit.HEARTS, Value.ACE);
    const king = new Card(Suit.HEARTS, Value.KING);

    expect(PlayCard.compareCards(ace, king, Suit.HEARTS)).toBe(true);
  });

  it("JOKER beats lower values", () => {
    const joker = new Card(Suit.HEARTS, Value.JOKER);
    const ten = new Card(Suit.HEARTS, Value.TEN);

    expect(PlayCard.compareCards(joker, ten, Suit.HEARTS)).toBe(true);
  });

  it("jick (left bower) is handled correctly", () => {
    const jick = Card.jick(Suit.SPADES);
    const other = new Card(Suit.SPADES, Value.TEN);

    expect(PlayCard.compareCards(jick, other, Suit.SPADES)).toBe(true);
  });

  it("jack beats jick", () => {
    const jack = new Card(Suit.SPADES, Value.JACK);
    const jick = Card.jick(Suit.SPADES);
    expect(PlayCard.compareCards(jack, jick, Suit.SPADES)).toBe(true);
  })
});

describe("PlayCard.isTrickOver", () => {
  it("returns true when 4 cards are played", () => {
    const trick: any = {
      cardsPlayed: {
        p1: {},
        p2: {},
        p3: {},
        p4: {}
      }
    };

    expect(PlayCard.isTrickOver(trick)).toBe(true);
  });

  it("returns false when fewer than 4 cards are played", () => {
    const trick: any = {
      cardsPlayed: {
        p1: {},
        p2: {}
      }
    };

    expect(PlayCard.isTrickOver(trick)).toBe(false);
  });
});

describe("PlayCard.calcTrickWinner", () => {
  it("returns the player with the highest card", () => {
    const gameState: any = {
      handCycle: {
        trumpSuit: Suit.HEARTS,
        trick: {
          startingPlayerId: "p1",
          cardsPlayed: {
            p1: new Card(Suit.HEARTS, Value.TEN),
            p2: new Card(Suit.HEARTS, Value.TWO),
            p3: new Card(Suit.HEARTS, Value.ACE),
            p4: new Card(Suit.HEARTS, Value.KING)
          }
        }
      }
    };

    const winner = PlayCard.calcTrickWinner(gameState);
    expect(winner).toBe("p3");
  });

  it("returns the player with the highest card (first)", () => {
    const gameState: any = {
      handCycle: {
        trumpSuit: Suit.HEARTS,
        trick: {
          startingPlayerId: "p1",
          cardsPlayed: {
            p1: new Card(Suit.HEARTS, Value.JACK),
            p2: new Card(Suit.HEARTS, Value.TWO), // trump
            p3: new Card(Suit.HEARTS, Value.TEN),
            p4: new Card(Suit.HEARTS, Value.JOKER)
          }
        }
      }
    };

    const winner = PlayCard.calcTrickWinner(gameState);
    expect(winner).toBe("p1");
  });
});

describe("PlayCard.isGameOver", () => {
  it("returns true when a team reaches 52", () => {
    const gameState: any = {
      teamOneScore: 52,
      teamTwoScore: 10
    };

    expect(PlayCard.isGameOver(gameState)).toBe(true);
  });

  it("returns false otherwise", () => {
    const gameState: any = {
      teamOneScore: 20,
      teamTwoScore: 30
    };

    expect(PlayCard.isGameOver(gameState)).toBe(false);
  });
});

describe("PlayCard.playCard", () => {
  it("returns null when not in PLAYING phase", () => {
    const game = createPlayingState();
    game.handCycle.handCycleStatus = HandCycleStatus.BIDDING;
    expect(PlayCard.playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.TEN))).toBeNull();
  });

  it("returns null when player is not found", () => {
    const game = createPlayingState();
    expect(PlayCard.playCard(game, "p99" as PlayerId, new Card(Suit.SPADES, Value.TEN))).toBeNull();
  });

  it("returns null when it is not the player's turn", () => {
    const game = createPlayingState("p1");
    game.players[1].hand = new Hand([new Card(Suit.SPADES, Value.ACE)]);
    expect(PlayCard.playCard(game, "p2" as PlayerId, new Card(Suit.SPADES, Value.ACE))).toBeNull();
  });

  it("returns null when card is not in player's hand", () => {
    const game = createPlayingState("p1");
    game.players[0].hand = new Hand([new Card(Suit.SPADES, Value.TEN)]);
    expect(PlayCard.playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.ACE))).toBeNull();
  });

  it("sets cardsPlayed to null and advances turn when player has no trump cards", () => {
    const game = createPlayingState("p1");
    const nonTrump = new Card(Suit.HEARTS, Value.TEN);
    game.players[0].hand = new Hand([nonTrump]);
    // Keep p2-p4 in the hand cycle so isHandCycleOver stays false
    game.players[1].hand = new Hand([new Card(Suit.SPADES, Value.TWO)]);
    game.players[2].hand = new Hand([new Card(Suit.SPADES, Value.THREE)]);
    game.players[3].hand = new Hand([new Card(Suit.SPADES, Value.FOUR)]);

    PlayCard.playCard(game, "p1" as PlayerId, nonTrump);

    expect(game.handCycle.trick.cardsPlayed["p1"]).toBeNull();
    expect(game.handCycle.trick.playerTurn).toBe("p2");
  });

  it("starts next trick after all 4 cards are played", () => {
    const game = createPlayingState("p1");
    game.players[0].hand = new Hand([new Card(Suit.SPADES, Value.TEN), new Card(Suit.SPADES, Value.TWO)]);
    game.players[1].hand = new Hand([new Card(Suit.SPADES, Value.ACE), new Card(Suit.SPADES, Value.THREE)]);
    game.players[2].hand = new Hand([new Card(Suit.SPADES, Value.KING), new Card(Suit.SPADES, Value.FOUR)]);
    game.players[3].hand = new Hand([new Card(Suit.SPADES, Value.JACK), new Card(Suit.SPADES, Value.FIVE)]);

    PlayCard.playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.TEN));
    PlayCard.playCard(game, "p2" as PlayerId, new Card(Suit.SPADES, Value.ACE));
    PlayCard.playCard(game, "p3" as PlayerId, new Card(Suit.SPADES, Value.KING));
    PlayCard.playCard(game, "p4" as PlayerId, new Card(Suit.SPADES, Value.JACK));

    expect(game.handCycle.trick.roundNumber).toBe(1);
  });

  it("sets COMPLETE status when game is over after hand cycle ends", () => {
    // bidWinner=p1 (index 0, team one), bidAmount=4; trick yields 5 pts → teamOneScore 50+5=55 ≥ 52
    const game = createPlayingState("p1", 4);
    game.teamOneScore = 50;
    game.players[0].hand = new Hand([new Card(Suit.SPADES, Value.ACE)]);   // 1 pt
    game.players[1].hand = new Hand([new Card(Suit.SPADES, Value.TWO)]);   // 1 pt
    game.players[2].hand = new Hand([new Card(Suit.SPADES, Value.THREE)]); // 3 pts
    game.players[3].hand = new Hand([new Card(Suit.SPADES, Value.FOUR)]);  // 0 pts

    PlayCard.playCard(game, "p1" as PlayerId, new Card(Suit.SPADES, Value.ACE));
    PlayCard.playCard(game, "p2" as PlayerId, new Card(Suit.SPADES, Value.TWO));
    PlayCard.playCard(game, "p3" as PlayerId, new Card(Suit.SPADES, Value.THREE));
    PlayCard.playCard(game, "p4" as PlayerId, new Card(Suit.SPADES, Value.FOUR));

    expect(game.handCycle.handCycleStatus).toBe(HandCycleStatus.COMPLETE);
  });
});

describe("PlayCard.compareCards (null and jick)", () => {
  it("returns true when cardB is null", () => {
    expect(PlayCard.compareCards(new Card(Suit.SPADES, Value.TWO), null as any, Suit.SPADES)).toBe(true);
  });

  it("returns false when cardA is null", () => {
    expect(PlayCard.compareCards(null as any, new Card(Suit.SPADES, Value.TWO), Suit.SPADES)).toBe(false);
  });

  it("returns true when cardA beats cardB that is the jick", () => {
    // jick of SPADES = CLUBS JACK; cardA = HEARTS KING (non-trump, non-ace, non-jick)
    // KING.value(14) >= JACK(12) → true
    const jick = Card.jick(Suit.SPADES);
    const king = new Card(Suit.HEARTS, Value.KING);
    expect(PlayCard.compareCards(king, jick, Suit.SPADES)).toBe(true);
  });

  it("returns false when cardA loses to cardB that is the jick", () => {
    // HEARTS NINE value(9) >= JACK(12) → false
    const jick = Card.jick(Suit.SPADES);
    const nine = new Card(Suit.HEARTS, Value.NINE);
    expect(PlayCard.compareCards(nine, jick, Suit.SPADES)).toBe(false);
  });
});

describe("PlayCard.tallyTrickPoints", () => {
  it("adds points to team two when an odd-index player wins the trick", () => {
    // p2 (index 1) wins with ACE
    const game: any = {
      players: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }],
      handCycle: {
        trumpSuit: Suit.SPADES,
        teamOnePoints: 0,
        teamTwoPoints: 0,
        trick: {
          startingPlayerId: "p2",
          cardsPlayed: {
            p1: new Card(Suit.SPADES, Value.TEN),
            p2: new Card(Suit.SPADES, Value.ACE),
            p3: new Card(Suit.SPADES, Value.TWO),
            p4: new Card(Suit.SPADES, Value.THREE)
          }
        }
      }
    };

    PlayCard.tallyTrickPoints(game, game.handCycle.trick);

    expect(game.handCycle.teamTwoPoints).toBeGreaterThan(0);
    expect(game.handCycle.teamOnePoints).toBe(0);
  });
});

describe("PlayCard.isHandCycleOver", () => {
  it("returns true when all players have no trump cards", () => {
    const game: any = {
      players: [
        { id: "p1", hand: new Hand() }, { id: "p2", hand: new Hand() },
        { id: "p3", hand: new Hand() }, { id: "p4", hand: new Hand() }
      ],
      handCycle: { trumpSuit: Suit.SPADES }
    };
    expect(PlayCard.isHandCycleOver(game)).toBe(true);
  });

  it("returns false when any player has trump cards", () => {
    const game: any = {
      players: [
        { id: "p1", hand: new Hand([new Card(Suit.SPADES, Value.TEN)]) },
        { id: "p2", hand: new Hand() }, { id: "p3", hand: new Hand() }, { id: "p4", hand: new Hand() }
      ],
      handCycle: { trumpSuit: Suit.SPADES }
    };
    expect(PlayCard.isHandCycleOver(game)).toBe(false);
  });
});

describe("PlayCard.tallyPointsHandCycle", () => {
  function makeGame(bidWinner: string, bidAmount: number, t1pts: number, t2pts: number): any {
    return {
      teamOneScore: 0,
      teamTwoScore: 0,
      players: [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }],
      handCycle: { bidWinner, bidAmount, teamOnePoints: t1pts, teamTwoPoints: t2pts }
    };
  }

  it("awards teamOneScore when team one makes their bid", () => {
    const game = makeGame("p1", 4, 6, 2);
    PlayCard.tallyPointsHandCycle(game);
    expect(game.teamOneScore).toBe(6);
    expect(game.teamTwoScore).toBe(2);
  });

  it("subtracts bid from teamOneScore when team one fails their bid", () => {
    const game = makeGame("p1", 8, 3, 7);
    PlayCard.tallyPointsHandCycle(game);
    expect(game.teamOneScore).toBe(-8);
    expect(game.teamTwoScore).toBe(7);
  });

  it("awards teamTwoScore when team two makes their bid", () => {
    const game = makeGame("p2", 4, 2, 6);
    PlayCard.tallyPointsHandCycle(game);
    expect(game.teamTwoScore).toBe(6);
    expect(game.teamOneScore).toBe(2);
  });

  it("subtracts bid from teamTwoScore when team two fails their bid", () => {
    const game = makeGame("p2", 8, 7, 3);
    PlayCard.tallyPointsHandCycle(game);
    expect(game.teamTwoScore).toBe(-8);
    expect(game.teamOneScore).toBe(7);
  });
});

describe("PlayCard.nextHandCycle", () => {
  it("rotates the dealer and transitions the new hand cycle to BIDDING", () => {
    const game = createPlayingState("p1"); // dealer = p1

    PlayCard.nextHandCycle(game);

    expect(game.handCycle.dealerId).toBe("p2");
    expect(game.handCycle.handCycleStatus).toBe(HandCycleStatus.BIDDING);
  });
});