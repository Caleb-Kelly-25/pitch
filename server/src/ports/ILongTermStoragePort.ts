import { User } from "../domain/entities/User";
import IUserRepository from "../domain/repositories/IUserRepository";

export default interface ILongTermStoragePort extends IUserRepository {
    // User methods
    getUserById(id: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    getAllUsers(): Promise<User[]>;
    findByUsername(username: string): Promise<User | null>;
    deleteUser(id: string): Promise<void>;
}