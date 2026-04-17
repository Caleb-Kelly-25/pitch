import ILongTermStoragePort from "../../ports/ILongTermStoragePort";
import { User } from "../../domain/entities/User";
import UserModel from "./MongoModels/UserModel";
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
}
