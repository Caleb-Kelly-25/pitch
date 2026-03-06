import { GameId } from "../../types/id-declarations";

export class User {
    public id: string;
    public username: string;
    public email: string;
    public photoUrl: string;
    public gameId: GameId | null;
    

    constructor(id: string, username: string, email: string, photoUrl: string, gameId: GameId | null) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.photoUrl = photoUrl;
        this.gameId = gameId;
    }
}