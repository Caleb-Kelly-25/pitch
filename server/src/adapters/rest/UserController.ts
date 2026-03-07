import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";
import IAuthAdapter from "../auth/IAuthAdapter";

export default class UserController {
    

    private userService: UserService;
    private authAdapter: IAuthAdapter;

    constructor (userService: UserService, authAdapter: IAuthAdapter) {
        this.userService = userService;
        this.authAdapter = authAdapter;
    }

    async login(req: Request, res: Response): Promise<unknown> {
        const u = await this.userService.getUserByUsername(req.body.username) as User;
        if (u == null){
            res.status(401).json({ error: "Invalid username or password" });
            return;
        } else {
            res.status(200).json({ token: this.authAdapter.signToken(u.id) });
        }
    }

    signup(req: Request, res: Response): unknown {
        throw new Error("Method not implemented.");
    }

}