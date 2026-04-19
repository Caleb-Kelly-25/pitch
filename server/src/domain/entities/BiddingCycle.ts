import { PlayerId } from "../../types/id-declarations";

export class BiddingCycle {
    currentBidderId: PlayerId;
    highestBidderId: PlayerId | null;
    highestBid: number;
    // undefined = player has not yet bid; number = their bid (0 = pass)
    playerBids: Record<PlayerId, number | undefined>;

    constructor(
        currentBidderId: PlayerId,
        highestBidderId: PlayerId | null,
        highestBid: number,
        playerBids: Record<PlayerId, number | undefined>,
    ) {
        this.currentBidderId = currentBidderId;
        this.highestBidderId = highestBidderId;
        this.highestBid = highestBid;
        this.playerBids = playerBids;
    }

    static fromJSONObject(data: any): BiddingCycle {
        const playerBids: Record<PlayerId, number | undefined> = {} as Record<PlayerId, number | undefined>;
        if (data.playerBids) {
            for (const [id, bid] of Object.entries(data.playerBids)) {
                playerBids[id as PlayerId] = bid as number | undefined;
            }
        }
        return new BiddingCycle(
            data.currentBidderId,
            data.highestBidderId ?? null,
            data.highestBid,
            playerBids,
        );
    }
}
