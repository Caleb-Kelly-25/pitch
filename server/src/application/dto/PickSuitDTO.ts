import { Suit } from "../../domain/enums/Suit";

export class PickSuitDTO {
    gameId: string;
    playerId: string;
    suit: Suit;

    constructor(gameId: string, playerId: string, suit: Suit) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.suit = suit;
    }
}
