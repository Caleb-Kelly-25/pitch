import IUserProfileRepository, { LeaderboardPage } from "../domain/repositories/IUserProfileRepository";
import { UserProfile } from "../domain/entities/UserProfile";

export default class UserProfileService {
    constructor(private readonly repo: IUserProfileRepository) {}

    async getProfile(userId: string): Promise<UserProfile> {
        return (await this.repo.findByUserId(userId)) ?? new UserProfile(userId);
    }

    /** Like getProfile, but persists a default document if one doesn't exist yet. */
    async getOrCreate(userId: string): Promise<UserProfile> {
        const existing = await this.repo.findByUserId(userId);
        if (existing) return existing;
        const fresh = new UserProfile(userId);
        await this.repo.save(fresh);
        return fresh;
    }

    async recordGameCompleted(userId: string, won: boolean): Promise<void> {
        await this.repo.increment(userId, {
            gamesCompleted: 1,
            ...(won ? { gamesWon: 1 } : {}),
        });
    }

    async recordCardPlayed(userId: string, count = 1): Promise<void> {
        await this.repo.increment(userId, { cardsPlayed: count });
    }

    async recordTrick(userId: string, won: boolean): Promise<void> {
        await this.repo.increment(userId, {
            tricksPlayed: 1,
            ...(won ? { tricksWon: 1 } : {}),
        });
    }

    async recordBid(userId: string, won: boolean): Promise<void> {
        await this.repo.increment(userId, {
            bidsPlayed: 1,
            ...(won ? { bidsWon: 1 } : {}),
        });
    }

    async getLeaderboard(page: number, limit: number): Promise<LeaderboardPage> {
        return this.repo.findLeaderboard(page, limit);
    }
}
