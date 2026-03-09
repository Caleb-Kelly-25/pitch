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
}