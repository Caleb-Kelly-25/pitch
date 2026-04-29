import { User } from "../../domain/entities/User";
import { UserProfile } from "../../domain/entities/UserProfile";
import type { ProfileIncrements, LeaderboardPage } from "../../domain/repositories/IUserProfileRepository";
import ILongTermStoragePort from "../../ports/ILongTermStoragePort";

// In-memory implementation of the long-term storage adapter
// This is the mock implementation for testing purposes.
export default class InMemoryLongTermStorageAdapter implements ILongTermStoragePort {
    private users: Map<string, User> = new Map<string, User>();
    private profiles: Map<string, UserProfile> = new Map<string, UserProfile>();

    findById(id: string): Promise<User | null> {
        return Promise.resolve(this.users.get(id) || null);
    }

    createUser(user: User): Promise<void> {
        user.id = crypto.randomUUID();
        this.users.set(user.id, user);
        return Promise.resolve();
    }

    getAllUsers(): Promise<User[]> {
        return Promise.resolve(Array.from(this.users.values()));
    }

    updateUser(user: User): Promise<void> {
        this.users.set(user.id, user);
        return Promise.resolve();
    }

    async findByUsername(username: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.username === username) return user;
        }
        return null;
    }

    deleteUser(id: string): Promise<void> {
        this.users.delete(id);
        return Promise.resolve();
    }

    findByUserId(userId: string): Promise<UserProfile | null> {
        return Promise.resolve(this.profiles.get(userId) ?? null);
    }

    save(profile: UserProfile): Promise<void> {
        this.profiles.set(profile.userId, { ...profile });
        return Promise.resolve();
    }

    increment(userId: string, updates: ProfileIncrements): Promise<void> {
        const existing = this.profiles.get(userId) ?? new UserProfile(userId);
        for (const [key, delta] of Object.entries(updates) as [keyof ProfileIncrements, number][]) {
            (existing as any)[key] = ((existing as any)[key] ?? 0) + delta;
        }
        this.profiles.set(userId, existing);
        return Promise.resolve();
    }

    async findLeaderboard(page: number, limit: number): Promise<LeaderboardPage> {
        const sorted = [...this.profiles.values()].sort((a, b) => b.gamesWon - a.gamesWon);
        const total = sorted.length;
        const slice = sorted.slice((page - 1) * limit, (page - 1) * limit + limit);
        const entries = slice.map(p => {
            const user = this.users.get(p.userId);
            return {
                userId:        p.userId,
                username:      user?.username ?? "Unknown",
                gamesCompleted: p.gamesCompleted,
                gamesWon:      p.gamesWon,
                tricksPlayed:  p.tricksPlayed,
                tricksWon:     p.tricksWon,
                bidsPlayed:    p.bidsPlayed,
                bidsWon:       p.bidsWon,
            };
        });
        return { entries, total, page, limit };
    }
}
