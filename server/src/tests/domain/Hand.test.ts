import { Hand } from "../../domain/entities/Hand";
import { Card } from "../../domain/entities/Card";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";

describe("Hand.addCard", () => {
  it("adds a card to the hand", () => {
    const hand = new Hand();

    const card = new Card(Suit.HEARTS, Value.ACE);
    hand.addCard(card);

    expect(hand.size()).toBe(1);
    expect(hand.hasCard(card)).toBe(true);
  });

  it("does not add duplicate cards", () => {
    const hand = new Hand();

    const card = new Card(Suit.HEARTS, Value.ACE);

    hand.addCard(card);
    hand.addCard(card);

    expect(hand.size()).toBe(1);
  });
});

describe("Hand.hasCard", () => {
  it("returns true if card exists", () => {
    const card = new Card(Suit.SPADES, Value.KING);
    const hand = new Hand([card]);

    expect(hand.hasCard(card)).toBe(true);
  });

  it("returns false if card does not exist", () => {
    const hand = new Hand([
      new Card(Suit.SPADES, Value.KING)
    ]);

    const other = new Card(Suit.HEARTS, Value.KING);

    expect(hand.hasCard(other)).toBe(false);
  });
});

describe("Hand.removeCard", () => {
  it("removes a card if it exists", () => {
    const card = new Card(Suit.CLUBS, Value.TEN);
    const hand = new Hand([card]);

    const removed = hand.removeCard(card);

    expect(removed).toBe(true);
    expect(hand.size()).toBe(0);
  });

  it("returns false if card does not exist", () => {
    const hand = new Hand([
      new Card(Suit.CLUBS, Value.TEN)
    ]);

    const removed = hand.removeCard(
      new Card(Suit.HEARTS, Value.TEN)
    );

    expect(removed).toBe(false);
    expect(hand.size()).toBe(1);
  });
});

describe("Hand.hasSuit", () => {
  it("returns true if hand contains suit", () => {
    const hand = new Hand([
      new Card(Suit.HEARTS, Value.TEN)
    ]);

    expect(hand.hasSuit(Suit.HEARTS)).toBe(true);
  });

  it("returns true if hand contains joker", () => {
    const hand = new Hand([
      new Card(Suit.SPADES, Value.JOKER)
    ]);

    expect(hand.hasSuit(Suit.HEARTS)).toBe(true);
  });

  it("returns true if hand contains jick", () => {
    const jick = Card.jick(Suit.HEARTS);

    const hand = new Hand([jick]);

    expect(hand.hasSuit(Suit.HEARTS)).toBe(true);
  });

  it("returns false if no match", () => {
    const hand = new Hand([
      new Card(Suit.CLUBS, Value.TEN)
    ]);

    expect(hand.hasSuit(Suit.HEARTS)).toBe(false);
  });
});

describe("Hand.size", () => {
  it("returns correct number of cards", () => {
    const hand = new Hand([
      new Card(Suit.HEARTS, Value.ACE),
      new Card(Suit.SPADES, Value.KING)
    ]);

    expect(hand.size()).toBe(2);
  });
});

describe("Hand.fromJSONObject", () => {
  it("reconstructs a Hand with Card instances", () => {
    const json: any = {
      cards: [
        { suit: Suit.HEARTS, value: Value.ACE },
        { suit: Suit.SPADES, value: Value.KING }
      ]
    };

    const hand = Hand.fromJSONObject(json);

    expect(hand.size()).toBe(2);
    expect(hand.cards[0]).toBeInstanceOf(Card);
    expect(hand.cards[0].suit).toBe(Suit.HEARTS);
    expect(hand.cards[1]).toBeInstanceOf(Card);
    expect(hand.cards[1].suit).toBe(Suit.SPADES);
    expect(hand.cards[1].value).toBe(Value.KING);
  });
});