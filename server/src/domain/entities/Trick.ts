import { PlayerId } from "../../types/id-declarations";
import { Card } from "./Card";

export class Trick {
    
    roundNumber: number;
    startingPlayerId: PlayerId;
    cardsPlayed: Record<PlayerId, Card | null>;
    playerTurn: PlayerId;

    constructor(roundNumber: number, startingPlayerId: PlayerId, cardsPlayed: Record<PlayerId, Card | null>, playerTurn: PlayerId) {
        this.roundNumber = roundNumber;
        this.startingPlayerId = startingPlayerId;
        this.cardsPlayed = cardsPlayed;
        this.playerTurn = playerTurn;
    }

    static fromJSONObject(data: any): Trick {
    // 1. Re-instantiate cards into a new Record
    const reconstructedCards: Record<PlayerId, Card | null> = {};

    if (data.cardsPlayed) {
        Object.entries(data.cardsPlayed).forEach(([playerId, cardData]) => {
            const card = cardData as any;
            reconstructedCards[playerId as PlayerId] = card 
                ? new Card(card.suit, card.value) 
                : null;
        });
    }

    // 2. Return new Trick matching the constructor: 
    // (roundNumber, startingPlayerId, cardsPlayed, playerTurn)
    return new Trick(
        data.roundNumber,
        data.startingPlayerId,
        reconstructedCards,
        data.playerTurn
    );
}
}