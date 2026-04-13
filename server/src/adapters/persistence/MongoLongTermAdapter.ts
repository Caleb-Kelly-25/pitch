import ILongTermStoragePort from "../../ports/ILongTermStoragePort";
import { User } from "../../domain/entities/User";
import UserModel from "./MongoModels/UserModel";


export class MongoLongTermAdapter implements ILongTermStoragePort {
    
    async createUser(user: User): Promise<void> {
        user.id = crypto.randomUUID();
        await UserModel.create({
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            photoUrl: user.photoUrl,
            gameId: user.gameId
        });

    }

    async updateUser(user: User): Promise<void> {
        await UserModel.updateOne({ id: user.id }, {
            username: user.username,
            email: user.email,
            password: user.password,
            photoUrl: user.photoUrl,
            gameId: user.gameId
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ username });
        if (!userDoc) {
            return null;
        }
        if (!userDoc.id){
            userDoc.id = crypto.randomUUID();
            UserModel.updateOne({ username: username }, { id: userDoc.id });
        }
        return userDoc as User; // Type assertion to convert IUserDocument to User entity
    }

    async findById(id: string): Promise<User | null> {
        console.log(await this.getAllUsers());
        const userDoc = await UserModel.findOne({ id });
        if (!userDoc) {
            return null;
        }
        return new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.photoUrl,
            userDoc.gameId
        ); 
    }

    async getAllUsers(): Promise<User[]> {
        const userDocs = await UserModel.find();
        return userDocs.map(userDoc => new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.photoUrl,
            userDoc.gameId
        ));
    }

    async deleteUser(id: string): Promise<void> {
        await UserModel.deleteOne({ id });
    }
}