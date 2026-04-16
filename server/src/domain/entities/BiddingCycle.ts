import { PlayerId } from "../../types/id-declarations";


export class BiddingCycle {

    currentBidderId: PlayerId;
    highestBidderId: PlayerId | null;
    highestBid: number;
    playerBids: Record<PlayerId, (number | undefined)>; //maps playerId to their bid, if they have not bid yet it will be undefined

    constructor(currentBidderId: PlayerId, highestBidderId: PlayerId | null, highestBid: number, playerBids: Record<PlayerId, (number | undefined)>) {
        this.currentBidderId = currentBidderId;
        this.highestBidderId = highestBidderId;
        this.highestBid = highestBid;
        this.playerBids = playerBids;
    }

    //This function is used to reconstruct a BiddingCycle from the Redis' JSON object
    static fromJSONObject(data: any): BiddingCycle {
        const reconstructedBids: Record<PlayerId, number> = {};

        // Reconstruct playerBids into a new Record
        if (data.playerBids) {
            Object.entries(data.playerBids).forEach(([PlayerId, bid]) => {
                reconstructedBids[PlayerId as PlayerId] = bid as number;
            })
        }

        //Return a new BiddingCycle matching the constructor:
        // (currentBidderId, highestBidderId, highestBid, playerBids)
        return new BiddingCycle(
            data.currentBidderId,
            data.highestBidderId,
            data.highestBid,
            reconstructedBids
        )
    }
}