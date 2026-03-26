import { Suit } from "../enums/Suit";
import {Value} from "../enums/Value";
import { Card } from "./Card";
import { HandCycleStatus } from "../enums/HandCycleStatus";
import { PlayerId } from "../../types/id-declarations";
import { BiddingCycle } from "./BiddingCycle";
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

    biddingCycle: BiddingCycle | null; //When bidding is done, this will be null and the handCycle will transition to playing
    trick: Trick | null; //When bidding or playing is done, this will be null

    constructor(dealerId: PlayerId, bidWinner: PlayerId, bidAmount: number, trumpSuit: Suit, blindCards: Card[], handCycleStatus: HandCycleStatus, teamOnePoints: number, teamTwoPoints: number, biddingCycle: BiddingCycle | null, trick: Trick | null) {
        this.dealerId = dealerId;
        this.bidWinner = bidWinner;
        this.bidAmount = bidAmount;
        this.trumpSuit = trumpSuit;
        this.blindCards = blindCards;
        this.handCycleStatus = handCycleStatus;
        this.teamOnePoints = teamOnePoints;
        this.teamTwoPoints = teamTwoPoints;
        this.biddingCycle = biddingCycle;
        this.trick = trick;
    }

    //I wonder if this should be in the PlayCard file instead of the HandCycle file, since it is closely related to the logic of playing a card
    canPlayCard(card: Card): boolean {
        if (this.handCycleStatus !== HandCycleStatus.PLAYING) {
            return false;
        } else if (card.suit !== this.trumpSuit && card.value!==Value.JOKER && !card.equals(Card.jick(this.trumpSuit))) {
            return false;
        }
        return true;
    }

    static fromJSONObject(handCycle: HandCycle): HandCycle {
        return new HandCycle(
            handCycle.dealerId, 
            handCycle.bidWinner, 
            handCycle.bidAmount, 
            handCycle.trumpSuit, 
            handCycle.blindCards.map(c => {const card = new Card(c.suit, c.value); return card;}),
            handCycle.handCycleStatus, 
            handCycle.teamOnePoints, 
            handCycle.teamTwoPoints, 

            //checks if biddingCycle and trick are present in the JSON, if they are it converts them to their respective classes, if not it sets them to null
            handCycle.biddingCycle ? BiddingCycle.fromJSONObject(handCycle.biddingCycle) : null, 
            handCycle.trick ? Trick.fromJSONObject(handCycle.trick) : null
        );
    }


}