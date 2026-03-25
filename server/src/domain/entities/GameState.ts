import { GameId } from "../../types/id-declarations";
import { HandCycle } from "./HandCycle";
import { Player } from "./Player";

export default class GameState {
    
    id: GameId;
    players: Player[];
    gameCode: string;
    handCycle: HandCycle;
    teamOneScore: number;
    teamTwoScore: number;

    constructor(id: GameId, players: Player[], gameCode: string, handCycle: HandCycle, teamOneScore: number, teamTwoScore: number) {
        this.id = id;
        this.players = players;
        this.gameCode = gameCode;
        this.handCycle = handCycle;
        this.teamOneScore = teamOneScore;
        this.teamTwoScore = teamTwoScore;
    }

    static fromJSONObject(json: GameState): GameState {
        const players: Player[] = json.players.map(p => Player.fromJSONObject(p));
        const handCycle: HandCycle = HandCycle.fromJSONObject(json.handCycle);
        return new GameState(json.id, players, json.gameCode, handCycle, json.teamOneScore, json.teamTwoScore);
    }
}
