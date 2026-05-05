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
    isBot: boolean;

    constructor(id: PlayerId, username: string, userId: UserId, hand:Hand, isBidder: boolean, isConnected: boolean, isDealer: boolean, currentBid: number, seatNumber: number, isBot: boolean = false) {
        this.id = id;
        this.username = username;
        this.userId = userId;
        this.hand = hand;
        this.isBidder = isBidder;
        this.isConnected = isConnected;
        this.isDealer = isDealer;
        this.currentBid = currentBid;
        this.seatNumber = seatNumber;
        this.isBot = isBot;
    }

    static fromJSONObject(p: Player): Player {
        return new Player(p.id, p.username, p.userId, Hand.fromJSONObject(p.hand), p.isBidder, p.isConnected, p.isDealer, p.currentBid, p.seatNumber, p.isBot ?? false);
    }
}