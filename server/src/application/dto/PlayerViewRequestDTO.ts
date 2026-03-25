export class PlayerViewRequestDTO {
    playerId: string;

    constructor(gameId: string, playerId: string) {
        this.playerId = playerId;
    }
}