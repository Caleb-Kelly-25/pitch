import { describe, it, expect } from "@jest/globals";

import { PlayCard } from "../../application/PlayCard";
import { Card } from "../../domain/entities/Card";
import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { PlayerId } from "../../types/id-declarations";

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