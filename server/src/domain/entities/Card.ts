import { Suit } from "../enums/Suit";
import { Value } from "../enums/Value";
export class Card {
    suit: Suit;
    value: Value;

    constructor(suit: Suit, value: Value) {
        this.suit = suit;
        this.value = value;
    }

    equals(other: Card): boolean {
        return this.suit === other.suit && this.value === other.value;
    }

    static jick(suit: Suit): Card {
        switch (suit){
            case Suit.CLUBS:
                return new Card(Suit.SPADES, Value.JACK);
            case Suit.SPADES:
                return new Card(Suit.CLUBS, Value.JACK);
            case Suit.HEARTS:
                return new Card(Suit.DIAMONDS, Value.JACK);
            default:
                return new Card(Suit.HEARTS, Value.JACK);
        }
    }

    static createFullDeck(): Card[] {
        const deck: Card[] = [];
        
        // Get all suits and values from your enums
        const suits = Object.values(Suit) as Suit[];
        const values = Object.values(Value) as Value[];

        // Generate the 54 cards
        for (const suit of suits) {
            for (const value of values) {
                // Ensure we only grab the actual enum values (if using numeric enums)
                if (typeof value === 'number') {
                    deck.push(new Card(suit, value));
                }
            }
        }

        const filtered = deck.filter(c => !(c.equals(new Card(Suit.DIAMONDS, Value.JOKER)) || c.equals(new Card(Suit.SPADES, Value.JOKER))));

        // Fisher-Yates Shuffle
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }

        return filtered;
    }

    static isSuited(card: Card, suit: Suit): boolean {
        return (card.suit === suit) || (card.equals(Card.jick(suit)) || (card.value === Value.JOKER));
    }
}