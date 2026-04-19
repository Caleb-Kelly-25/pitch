import bcrypt from "bcrypt";
import { Request, Response } from "express-serve-static-core";
import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";
import IAuthAdapter from "../auth/IAuthAdapter";

export default class UserController {
    private userService: UserService;
    private authAdapter: IAuthAdapter;

    constructor(userService: UserService, authAdapter: IAuthAdapter) {
        this.userService = userService;
        this.authAdapter = authAdapter;
    }

    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }

        const user = await this.userService.getUserByUsername(username);
        if (!user) {
            res.status(401).json({ error: "Invalid username or password" });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: "Invalid username or password" });
            return;
        }

        res.status(200).json({ 
            token: this.authAdapter.signToken(user.id, user.username),
            user: { id: user.id, username: user.username }
        });
    }

    async signup(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }

        const existing = await this.userService.getUserByUsername(username);
        if (existing) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }

        const newUser = await this.userService.createUser(new User("", username, "", password, null, null));
        if (!newUser) {
            res.status(500).json({ error: "Failed to create user" });
            return;
        }

        res.status(201).json({ 
            token: this.authAdapter.signToken(newUser.id, newUser.username),
            user: { id: newUser.id, username: newUser.username }
        });
    }
}
