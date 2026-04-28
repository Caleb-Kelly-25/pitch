import { User } from "../domain/entities/User";
import IUserRepository from "../domain/repositories/IUserRepository";
import IUserProfileRepository from "../domain/repositories/IUserProfileRepository";

export default interface ILongTermStoragePort extends IUserRepository, IUserProfileRepository {
    // User methods
    findById(id: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    getAllUsers(): Promise<User[]>;
    findByUsername(username: string): Promise<User | null>;
    deleteUser(id: string): Promise<void>;
}
