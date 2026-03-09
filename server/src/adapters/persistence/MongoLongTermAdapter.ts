import ILongTermStoragePort from "../../ports/ILongTermStoragePort";
import { User } from "../../domain/entities/User";
import UserModel from "./MongoModels/UserModel";


export class MongoLongTermAdapter implements ILongTermStoragePort {
    
    async createUser(user: User): Promise<void> {
        await UserModel.create({
            id: user.id,
            username: user.username, // Map 'name' from User entity to 'username' in MongoDB schema
            email: user.email,
            password: user.password,
            photoUrl: user.photoUrl,
            gameId: user.gameId
        });

    }

    async getUserById(id: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ id });
        if (!userDoc) {
            return null;
        }
        return userDoc as User; // Type assertion to convert IUserDocument to User entity
    }

    async getAllUsers(): Promise<User[]> {
        const userDocs = await UserModel.find();
        return userDocs as User[]; 
    }

    async deleteUser(id: string): Promise<void> {
        await UserModel.deleteOne({ id });
    }
}