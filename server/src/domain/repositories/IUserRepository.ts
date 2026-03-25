import { User } from "../entities/User";

export default interface IUserRepository {
    findById(id: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    getAllUsers(): Promise<User[]>;
    updateUser(user: User): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
    deleteUser(id: string): Promise<void>;
}