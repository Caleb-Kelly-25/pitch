import { PlayerId, UserId } from "../../types/id-declarations";
import { Hand } from "./Hand";

export class Player {
    id: PlayerId;
    username: string;
    userId: UserId;
    hand: Hand;
    isBidder: boolean;
    isConnected: boolean;
    isDealer: boolean;
    currentBid: number;
    seatNumber: number;

    constructor(id: PlayerId, username: string, userId: UserId, hand:Hand, isBidder: boolean, isConnected: boolean, isDealer: boolean, currentBid: number, seatNumber: number) {
        this.id = id;
        this.username = username;
        this.userId = userId;
        this.hand = hand;
        this.isBidder = isBidder;
        this.isConnected = isConnected;
        this.isDealer = isDealer;
        this.currentBid = currentBid;
        this.seatNumber = seatNumber;
    }
}