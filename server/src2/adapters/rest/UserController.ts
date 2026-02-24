import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";

export default class UserController {
    

    private userService: UserService;

    constructor (userService: UserService) {
        this.userService = userService;
    }

    login(req: Request, res: Response): unknown {
        throw new Error("Method not implemented.");
    }

    signup(req: Request, res: Response): unknown {
        throw new Error("Method not implemented.");
    }

}