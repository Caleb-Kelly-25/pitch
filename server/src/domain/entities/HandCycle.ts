import { Suit } from "../enums/Suit";
import { Value } from "../enums/Value";
import { Card } from "./Card";
import { Player } from "./Player";
import { HandCycleStatus } from "../enums/HandCycleStatus";
import GameState from "./GameState";
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

    //NOTE: Currently not being used, but handles transitions between statuses
    public nextStatus(gameState: GameState) {
        switch(this.handCycleStatus) {
            case HandCycleStatus.WAITING:
                this.startBidding(gameState.players); 
                this.handCycleStatus = HandCycleStatus.BIDDING;
                break;
            case HandCycleStatus.BIDDING:
                this.bidWinner = this.biddingCycle!.highestBidderId!; //the ! is safe here because if BIDDING then biddingCycle and highestBidderId are guaranteed
                this.bidAmount = this.biddingCycle!.highestBid;

                this.handCycleStatus = HandCycleStatus.PLAYING;

                this.biddingCycle = null;
                this.trick = new Trick(0, this.bidWinner, {} as Record<PlayerId, Card | null>, this.bidWinner);
                break;
            case HandCycleStatus.PLAYING:
                //PlayCard.tallyPointsHandCycle(gameState); //right now calls this but function will probably change
                
                if (this.teamOnePoints >= 52 || this.teamTwoPoints >= 52) { //if (PlayCard.isGameOver(gameState)) {
                    this.handCycleStatus = HandCycleStatus.COMPLETE;
                    //call some GameOver function here later? probably in GameState file
                } else {
                    //PlayCard.nextHandCycle(gameState); //right now calls this but function will probably change
                    //Call function in GameState that closes this handCycle and creates a new one
                    //gameState.rotateHandCycle(); <-- this is what I want to do but it does create circular dependency, need to figure out how to resolve that
                }
                break;
            case HandCycleStatus.COMPLETE:
                //TBD idk what would go here if we even need it, maybe some cleanup? 
                break;
            default:
                throw new Error(`Invalid hand cycle status: ${this.handCycleStatus}`);
        }
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

    //Starts the bidding phase of each HandCycle, inits the biddingCycle and changes Status
    public startBidding(players: Player[]) {
        const dealerIndex = players.findIndex(player => player.id === this.dealerId);

        const biddingOrder = [
            ...players.slice(dealerIndex + 1), //Starts with dealer index until end of array
            ...players.slice(0, dealerIndex + 1) //Adds the players before the dealer index + dealer
        ]

        this.biddingCycle = new BiddingCycle(
            biddingOrder[0].id as PlayerId, //currentBidderId
            null, //highestBidderId
            0, //highestBid
            {} as Record<PlayerId, number | undefined> //playerBids, will be filled for players as undefined
        );

        //Initialize all player bids to undefined
        biddingOrder.forEach(player => {
            this.biddingCycle!.playerBids[player.id as PlayerId] = undefined;
        })
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