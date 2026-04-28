import ILongTermStoragePort from "../../ports/ILongTermStoragePort";
import { User } from "../../domain/entities/User";
import { UserProfile } from "../../domain/entities/UserProfile";
import UserModel from "./MongoModels/UserModel";
import UserProfileModel from "./MongoModels/UserProfileModel";
import { ProfileIncrements, LeaderboardPage } from "../../domain/repositories/IUserProfileRepository";
import { GameId } from "../../types/id-declarations";


export class MongoLongTermAdapter implements ILongTermStoragePort {

    async createUser(user: User): Promise<void> {
        user.id = crypto.randomUUID();
        await UserModel.create({
            _id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            photoUrl: user.photoUrl ?? null,
            gameId: user.gameId ?? null,
        });
    }

    async updateUser(user: User): Promise<void> {
        await UserModel.updateOne({ _id: user.id }, {
            username: user.username,
            email: user.email,
            password: user.password,
            photoUrl: user.photoUrl ?? null,
            gameId: user.gameId ?? null,
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ username });
        if (!userDoc) return null;
        return new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.photoUrl ?? null,
            userDoc.gameId ? userDoc.gameId as GameId : null,
        );
    }

    async findById(id: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ _id: id });
        if (!userDoc) return null;
        return new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.photoUrl ?? null,
            userDoc.gameId ? userDoc.gameId as GameId : null,
        );
    }

    async getAllUsers(): Promise<User[]> {
        const userDocs = await UserModel.find();
        return userDocs.map(userDoc => new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.photoUrl ?? null,
            userDoc.gameId ? userDoc.gameId as GameId : null,
        ));
    }

    async deleteUser(id: string): Promise<void> {
        await UserModel.deleteOne({ _id: id });
    }

    // ── UserProfile ───────────────────────────────────────────────────────────

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const doc = await UserProfileModel.findById(userId);
        if (!doc) return null;
        return new UserProfile(
            userId,
            doc.gamesCompleted,
            doc.gamesWon,
            doc.cardsPlayed,
            doc.tricksPlayed,
            doc.tricksWon,
            doc.bidsPlayed,
            doc.bidsWon,
        );
    }

    async save(profile: UserProfile): Promise<void> {
        await UserProfileModel.findByIdAndUpdate(
            profile.userId,
            {
                $set: {
                    gamesCompleted: profile.gamesCompleted,
                    gamesWon:       profile.gamesWon,
                    cardsPlayed:    profile.cardsPlayed,
                    tricksPlayed:   profile.tricksPlayed,
                    tricksWon:      profile.tricksWon,
                    bidsPlayed:     profile.bidsPlayed,
                    bidsWon:        profile.bidsWon,
                },
            },
            { upsert: true, new: true },
        );
    }

    async increment(userId: string, updates: ProfileIncrements): Promise<void> {
        await UserProfileModel.findByIdAndUpdate(
            userId,
            { $inc: updates, $setOnInsert: { _id: userId } },
            { upsert: true },
        );
    }

    async findLeaderboard(page: number, limit: number): Promise<LeaderboardPage> {
        const skip = (page - 1) * limit;

        const [result] = await UserProfileModel.aggregate([
            {
                $facet: {
                    entries: [
                        { $sort: { gamesWon: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "userInfo",
                            },
                        },
                        {
                            $project: {
                                userId: "$_id",
                                username: { $ifNull: [{ $arrayElemAt: ["$userInfo.username", 0] }, "Unknown"] },
                                gamesCompleted: 1,
                                gamesWon: 1,
                                tricksPlayed: 1,
                                tricksWon: 1,
                                bidsPlayed: 1,
                                bidsWon: 1,
                            },
                        },
                    ],
                    totalCount: [{ $count: "n" }],
                },
            },
        ]);

        const total: number = result?.totalCount?.[0]?.n ?? 0;
        const entries = (result?.entries ?? []).map((e: any) => ({
            userId:        e.userId,
            username:      e.username,
            gamesCompleted: e.gamesCompleted,
            gamesWon:      e.gamesWon,
            tricksPlayed:  e.tricksPlayed,
            tricksWon:     e.tricksWon,
            bidsPlayed:    e.bidsPlayed,
            bidsWon:       e.bidsWon,
        }));

        return { entries, total, page, limit };
    }
}
