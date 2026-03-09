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
}
