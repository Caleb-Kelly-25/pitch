import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";

export class DiscardHandCardDTO {
    gameId: string;
    playerId: string;
    cardSuit: Suit;
    cardValue: Value;

    constructor(gameId: string, playerId: string, cardSuit: Suit, cardValue: Value) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.cardSuit = cardSuit;
        this.cardValue = cardValue;
    }
}
