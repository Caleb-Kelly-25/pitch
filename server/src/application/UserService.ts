import { User } from "../domain/entities/User";

export default class UserService {
    private userRepository: any;
    constructor (userRepository: any) {
        this.userRepository = userRepository;
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async createUser(user: User): Promise<User | null> {
        return this.userRepository.create(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}