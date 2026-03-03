import { PlayerId, UserId } from "../../types/id-declarations";
import { Hand } from "./Hand";

export class Player {
    id: PlayerId;
    userId: UserId;
    hand: Hand;
    isBidder: boolean;
    isConnected: boolean;
    isDealer: boolean;
    currentBid: number;
    seatNumber: number;

    constructor(id: PlayerId, userId: UserId, hand:Hand, isBidder: boolean, isConnected: boolean, isDealer: boolean, currentBid: number, seatNumber: number) {
        this.id = id;
        this.userId = userId;
        this.hand = hand;
        this.isBidder = isBidder;
        this.isConnected = isConnected;
        this.isDealer = isDealer;
        this.currentBid = currentBid;
        this.seatNumber = seatNumber;
    }
}