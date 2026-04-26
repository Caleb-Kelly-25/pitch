import { GameId, PlayerId } from "../../types/id-declarations";
import { HandCycle, handCycleFromJSON } from "./HandCycle";
import { Player } from "./Player";
import { Card } from "./Card";

export interface LastHandResult {
    teamOneCardsWon: Card[];
    teamTwoCardsWon: Card[];
    bidWinnerId: PlayerId;
    bidAmount: number;
}

export default class GameState {
    id: GameId;
    players: Player[];
    gameCode: string;
    handCycle: HandCycle;
    teamOneScore: number;
    teamTwoScore: number;
    lastHandResult: LastHandResult | null = null;

    constructor(id: GameId, players: Player[], gameCode: string, handCycle: HandCycle, teamOneScore: number, teamTwoScore: number) {
        this.id = id;
        this.players = players;
        this.gameCode = gameCode;
        this.handCycle = handCycle;
        this.teamOneScore = teamOneScore;
        this.teamTwoScore = teamTwoScore;
    }

    static fromJSONObject(json: any): GameState {
        const players = json.players.map((p: any) => Player.fromJSONObject(p));
        const handCycle = handCycleFromJSON(json.handCycle);
        const gs = new GameState(json.id, players, json.gameCode, handCycle, json.teamOneScore, json.teamTwoScore);
        if (json.lastHandResult) {
            gs.lastHandResult = {
                teamOneCardsWon: json.lastHandResult.teamOneCardsWon.map((c: any) => new Card(c.suit, c.value)),
                teamTwoCardsWon: json.lastHandResult.teamTwoCardsWon.map((c: any) => new Card(c.suit, c.value)),
                bidWinnerId: json.lastHandResult.bidWinnerId,
                bidAmount: json.lastHandResult.bidAmount,
            };
        }
        return gs;
    }
}
