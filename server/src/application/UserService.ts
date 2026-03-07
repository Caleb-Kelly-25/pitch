import { User } from "../domain/entities/User";
import IUserRepository from "../domain/repositories/IUserRepository";

export default class UserService {
    private userRepository: IUserRepository;
    constructor (userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async createUser(user: User): Promise<User | null> {
        await this.userRepository.createUser(user);
        return this.userRepository.findByUsername(user.username);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.userRepository.findByUsername(username);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.getAllUsers();
    }
}