import { GameId, PlayerId } from "../../types/id-declarations";
import { HandCycleStatus } from "../enums/HandCycleStatus";
import { Suit } from "../enums/Suit";
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

    public initializeHandCycle(dealerId: PlayerId) {
        this.handCycle = new HandCycle(
            dealerId,
            "" as PlayerId, //bidWinner will be determined after bidding
            0,
            null, //trumpSuit will be determined after bidding
            [],
            HandCycleStatus.WAITING,
            0,
            0,
            null,
            null
        )
        
        //transition to next Phase right after initializing
        this.handCycle.nextStatus(this); 
    }

    static fromJSONObject(json: GameState): GameState {
        const players: Player[] = json.players.map(p => Player.fromJSONObject(p));
        const handCycle: HandCycle = HandCycle.fromJSONObject(json.handCycle);
        return new GameState(json.id, players, json.gameCode, handCycle, json.teamOneScore, json.teamTwoScore);
    }


}
