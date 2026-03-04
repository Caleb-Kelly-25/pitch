import { PlayerId, TeamId } from "../../types/id-declarations";

export class Team {
    id: TeamId;
    playerIds: PlayerId[];
    totalPoints: number;
    constructor(id: TeamId, playerIds: PlayerId[], totalPoints: number) {
        this.id = id;
        this.playerIds = playerIds;
        this.totalPoints = totalPoints;
    }
}