import { User } from "../entities/User";

export default interface IUserRepository {
    getUserById(id: string): Promise<User | null>;
    createUser(user: User): Promise<void>;
    getAllUsers(): Promise<User[]>;
    deleteUser(id: string): Promise<void>;
}