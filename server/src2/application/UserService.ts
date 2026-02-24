import { User } from "../domain/entities/User";

export default class UserService {
    private userRepository: any;
    constructor (userRepository: any) {
        this.userRepository = userRepository;
    }

    getUserById(id: string) {
        return this.userRepository.findById(id);
    }

    createUser(user: User) {
        return this.userRepository.create(user);
    }

    getAllUsers() {
        return this.userRepository.findAll();
    }
}