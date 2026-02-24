import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";

export default class UserController {
    private userService: UserService;

    constructor (userService: UserService) {
        this.userService = userService;
    }

    getUserById(id: string, getUserById: any) {
        throw new Error("Method not implemented.");
    }

    createUser(user: User) {
        throw new Error("Method not implemented.");
    }

    getAllUsers() {
        throw new Error("Method not implemented.");
    }
}