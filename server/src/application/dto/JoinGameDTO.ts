export class JoinGameDTO {
    gameCode: string;
    userId: string;

    constructor(gameCode: string, userId: string) {
        this.gameCode = gameCode;
        this.userId = userId;
    }
}
