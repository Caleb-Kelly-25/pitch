import assert from "assert";
import { Card } from "./Card";
import { Value } from "../enums/Value";
import { Suit } from "../enums/Suit";
export class Hand {
    
    cards: Card[];

    constructor(cards: Card[] = []) {
        this.cards = cards;
    }

    addCard(card: Card): void {
        assert(card != null, "Card cannot be null");
        if (!this.hasCard(card)) {
            this.cards.push(card);
        }
    }

    size(): number {
        return this.cards.length;
    }

    hasCard(card: Card): boolean {
        return this.cards.some(c => c.equals(card));
    }

    removeCard(card: Card): boolean {
        if (!this.hasCard(card)) {
            return false;
        } else {
            this.cards = this.cards.filter(c => !c.equals(card));
            return true;
        }
    }

    hasSuit(suit: Suit): boolean {
        return this.cards.some(c => c.suit === suit) || this.cards.some(c => c.value === Value.JOKER) || this.cards.some(c => c.suit === Card.jick(suit).suit && c.value === Value.JACK);
    }

    static fromJSONObject(hand: Hand): Hand {
        return new Hand(hand.cards.map(c => {const card = new Card(c.suit, c.value); return card;}));
    }
}