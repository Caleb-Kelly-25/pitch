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
            res.status(200).json({ token: this.authAdapter.signToken(u.id, u.username) });
        }
    }

    async signup(req: Request, res: Response): Promise<unknown> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }
        const alreadyUser = await this.userService.getUserByUsername(username);
        if (alreadyUser) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }
        const user = new User("", username,"",password,"",null);
        const newUser = await this.userService.createUser(user);
        if (!newUser) {
            res.status(500).json({ error: "Failed to create user" });
            return;
        }
        res.status(201).json({ token: this.authAdapter.signToken(newUser.id, newUser.username) });
    }

}