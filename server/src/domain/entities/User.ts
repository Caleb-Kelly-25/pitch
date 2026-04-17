import { GameId } from "../../types/id-declarations";

export class User {
    public id: string;
    public username: string;
    public email: string;
    public password: string;
    public photoUrl: string | null;
    public gameId: GameId | null;
    

    constructor(id: string, name: string, email: string, password: string, photoUrl: string|null, gameId: GameId | null | undefined) {
        this.id = id;
        this.username = name;
        this.email = email;
        this.password = password;
        this.photoUrl = photoUrl;
        this.gameId = gameId ? gameId : null;
    }
}