import assert from "assert";
import { Card } from "./Card";
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
}