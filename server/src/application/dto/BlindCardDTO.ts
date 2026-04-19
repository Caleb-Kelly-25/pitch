import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";

export class BlindCardDTO {
    gameId: string;
    playerId: string;
    action: 'keep' | 'discard' | 'swap';
    swapSuit?: Suit;
    swapValue?: Value;

    constructor(gameId: string, playerId: string, action: 'keep' | 'discard' | 'swap', swapSuit?: Suit, swapValue?: Value) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.action = action;
        this.swapSuit = swapSuit;
        this.swapValue = swapValue;
    }
}
