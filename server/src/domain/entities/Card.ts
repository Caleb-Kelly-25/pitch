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
}