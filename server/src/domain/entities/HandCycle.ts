import { Suit } from "../enums/Suit";
import {Value} from "../enums/Value";
import { Card } from "./Card";
import { HandCycleStatus } from "../enums/HandCycleStatus";
import { PlayerId } from "../../types/id-declarations";
import { Trick } from "./Trick";

export class HandCycle {
    dealerId: PlayerId;
    bidWinner: PlayerId;
    bidAmount: number;
    trumpSuit: Suit;
    blindCards: Card[];
    handCycleStatus: HandCycleStatus;
    teamOnePoints: number;
    teamTwoPoints: number;
    trick: Trick;

    constructor(dealerId: PlayerId, bidWinner: PlayerId, bidAmount: number, trumpSuit: Suit, blindCards: Card[], handCycleStatus: HandCycleStatus, teamOnePoints: number, teamTwoPoints: number, trick: Trick) {
        this.dealerId = dealerId;
        this.bidWinner = bidWinner;
        this.bidAmount = bidAmount;
        this.trumpSuit = trumpSuit;
        this.blindCards = blindCards;
        this.handCycleStatus = handCycleStatus;
        this.teamOnePoints = teamOnePoints;
        this.teamTwoPoints = teamTwoPoints;
        this.trick = trick;
    }

    canPlayCard(card: Card): boolean {
        if (this.handCycleStatus !== HandCycleStatus.PLAYING) {
            return false;
        } else if (card.suit !== this.trumpSuit && card.value!==Value.JACK && !card.equals(Card.jick(this.trumpSuit))) {
            return false;
        }
        return true;
    }


}