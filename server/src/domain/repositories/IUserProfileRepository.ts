import { UserProfile } from "../entities/UserProfile";

export type ProfileIncrements = Partial<Omit<Record<keyof UserProfile, number>, 'userId'>>;

export interface LeaderboardEntry {
    userId: string;
    username: string;
    gamesCompleted: number;
    gamesWon: number;
    tricksPlayed: number;
    tricksWon: number;
    bidsPlayed: number;
    bidsWon: number;
}

export interface LeaderboardPage {
    entries: LeaderboardEntry[];
    total: number;
    page: number;
    limit: number;
}

export default interface IUserProfileRepository {
    findByUserId(userId: string): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<void>;
    increment(userId: string, updates: ProfileIncrements): Promise<void>;
    findLeaderboard(page: number, limit: number): Promise<LeaderboardPage>;
}
