export class BidDTO {
    gameId: string;
    playerId: string;
    bidAmount: number;

    constructor(gameId: string, playerId: string, bidAmount: number) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.bidAmount = bidAmount;
    }
}