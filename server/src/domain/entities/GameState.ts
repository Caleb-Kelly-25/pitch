import { GameId } from "../../types/id-declarations";
import { HandCycle } from "./HandCycle";
import { Team } from "./Team";

export default class GameState {
    id: GameId;
    teamOne: Team;
    teamTwo: Team;
    handCycle: HandCycle;
    teamOneScore: number;
    teamTwoScore: number;

    constructor(id: GameId, teamOne: Team, teamTwo: Team, handCycle: HandCycle, teamOneScore: number, teamTwoScore: number) {
        this.id = id;
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
        this.handCycle = handCycle;
        this.teamOneScore = teamOneScore;
        this.teamTwoScore = teamTwoScore;
    }
}
