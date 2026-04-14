import {Card} from "../../domain/entities/Card";
import {Suit} from "../../domain/enums/Suit";
import {Value} from "../../domain/enums/Value";

describe("Card class", () => {
  describe("constructor", () => {
    it("should create a card with correct suit and value", () => {
      const card = new Card(Suit.HEARTS, Value.ACE);

      expect(card.suit).toBe(Suit.HEARTS);
      expect(card.value).toBe(Value.ACE);
    });
  });

  describe("equals", () => {
    it("should return true for identical cards", () => {
      const c1 = new Card(Suit.SPADES, Value.KING);
      const c2 = new Card(Suit.SPADES, Value.KING);

      expect(c1.equals(c2)).toBe(true);
    });

    it("should return false for different suits", () => {
      const c1 = new Card(Suit.SPADES, Value.KING);
      const c2 = new Card(Suit.HEARTS, Value.KING);

      expect(c1.equals(c2)).toBe(false);
    });

    it("should return false for different values", () => {
      const c1 = new Card(Suit.SPADES, Value.KING);
      const c2 = new Card(Suit.SPADES, Value.QUEEN);

      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe("jick", () => {
    it("should return correct paired jack for CLUBS", () => {
      const result = Card.jick(Suit.CLUBS);

      expect(result.equals(new Card(Suit.SPADES, Value.JACK))).toBe(true);
    });

    it("should return correct paired jack for SPADES", () => {
      const result = Card.jick(Suit.SPADES);

      expect(result.equals(new Card(Suit.CLUBS, Value.JACK))).toBe(true);
    });

    it("should return correct paired jack for HEARTS", () => {
      const result = Card.jick(Suit.HEARTS);

      expect(result.equals(new Card(Suit.DIAMONDS, Value.JACK))).toBe(true);
    });

    it("should return correct paired jack for DIAMONDS (default case)", () => {
      const result = Card.jick(Suit.DIAMONDS);

      expect(result.equals(new Card(Suit.HEARTS, Value.JACK))).toBe(true);
    });
  });

  describe("createFullDeck", () => {
    it("should create a deck of 52 cards", () => {
      const deck = Card.createFullDeck();

      expect(deck.length).toBe(52);
    });

    it("should contain unique cards", () => {
      const deck = Card.createFullDeck();

      const unique = new Set(
        deck.map(card => `${card.suit}-${card.value}`)
      );

      expect(unique.size).toBe(52);
    });

    it("should contain all suit/value combinations", () => {
      const deck = Card.createFullDeck();

      const allCombos: string[] = [];
      const suits = Object.values(Suit) as Suit[];
      const values = Object.values(Value) as Value[];

      for (const suit of suits) {
        for (const value of values) {
          if (typeof value === "number") {
            allCombos.push(`${suit}-${value}`);
          }
        }
      }

      const deckSet = new Set(deck.map(c => `${c.suit}-${c.value}`));

      for (const combo of allCombos) {
        expect(deckSet.has(combo)).toBe(true);
      }
    });

    it("should shuffle the deck (probabilistic test)", () => {
      const deck1 = Card.createFullDeck();
      const deck2 = Card.createFullDeck();

      const sameOrder = deck1.every((card, i) =>
        card.equals(deck2[i])
      );

      // Extremely unlikely to be identical if shuffled
      expect(sameOrder).toBe(false);
    });
  });
});