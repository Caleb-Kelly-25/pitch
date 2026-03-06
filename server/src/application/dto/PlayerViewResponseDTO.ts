import { PlayerId } from "../../types/id-declarations";

export class PlayerViewReponseDTO {
    playerId: PlayerId;
    username: string;
    
    constructor(playerId: PlayerId, username: string) {
        this.playerId = playerId;
        this.username = username;
    }
}