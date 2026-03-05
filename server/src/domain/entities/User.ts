import { GameId } from "../../types/id-declarations";

export class User {
    public id: string;
    public name: string;
    public email: string;
    public password: string;
    public photoUrl: string;
    public gameId: GameId | null;
    

    constructor(id: string, name: string, email: string, password: string, photoUrl: string, gameId: GameId | null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.photoUrl = photoUrl;
        this.gameId = gameId;
    }
}