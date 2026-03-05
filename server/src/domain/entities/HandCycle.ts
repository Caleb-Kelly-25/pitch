import { Suit } from "../enums/Suit";
import { Card } from "./Card";
import { HandCycleStatus } from "../enums/HandCycleStatus";
import { PlayerId } from "../../types/id-declarations";

export class HandCycle {
    dealerId: PlayerId;
    bidWinner: PlayerId;
    bidAmount: number;
    trumpSuit: Suit;
    blindCards: Card[];
    handCycleStatus: HandCycleStatus;
    team1Points: number;
    team2Points: number;

    constructor(dealerId: PlayerId, bidWinner: PlayerId, bidAmount: number, trumpSuit: Suit, blindCards: Card[], handCycleStatus: HandCycleStatus, team1Points: number, team2Points: number) {
        this.dealerId = dealerId;
        this.bidWinner = bidWinner;
        this.bidAmount = bidAmount;
        this.trumpSuit = trumpSuit;
        this.blindCards = blindCards;
        this.handCycleStatus = handCycleStatus;
        this.team1Points = team1Points;
        this.team2Points = team2Points;
    }


}