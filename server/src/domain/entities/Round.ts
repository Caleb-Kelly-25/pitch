import { PlayerId } from "../../types/id-declarations";
import { Card } from "./Card";

export class Round {
    roundNumber: number;
    startingPlayerId: PlayerId;
    cardsPlayed: Card[];

    constructor(roundNumber: number, startingPlayerId: PlayerId, cardsPlayed: Card[]) {
        this.roundNumber = roundNumber;
        this.startingPlayerId = startingPlayerId;
        this.cardsPlayed = cardsPlayed;
    }
}