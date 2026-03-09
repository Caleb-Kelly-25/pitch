import { PlayerId } from "../../types/id-declarations";
import { Card } from "./Card";

export class Trick {
    roundNumber: number;
    startingPlayerId: PlayerId;
    cardsPlayed: Map<PlayerId, Card | null>;
    playerTurn: PlayerId;

    constructor(roundNumber: number, startingPlayerId: PlayerId, cardsPlayed: Map<PlayerId, Card | null>, playerTurn: PlayerId) {
        this.roundNumber = roundNumber;
        this.startingPlayerId = startingPlayerId;
        this.cardsPlayed = cardsPlayed;
        this.playerTurn = playerTurn;
    }
}