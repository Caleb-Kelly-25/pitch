import { GameId } from "../../types/id-declarations";

export class User {
    public id: string;
    public name: string;
    public email: string;
    public photoUrl: string;
    public gameId: GameId | null;
    

    constructor(id: string, name: string, email: string, photoUrl: string, gameId: GameId | null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.photoUrl = photoUrl;
        this.gameId = gameId;
    }
}