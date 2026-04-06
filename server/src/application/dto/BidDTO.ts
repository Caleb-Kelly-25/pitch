export class BidDTO {
    gameId: string;
    playerId: string;
    bidValue: number;

    constructor(gameId: string, playerId: string, bidValue: number) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.bidValue = bidValue;
    }
}