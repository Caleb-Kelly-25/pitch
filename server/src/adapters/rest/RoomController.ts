import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";
import IAuthAdapter from "../auth/IAuthAdapter";
import { RoomService } from "../../application/RoomService";
import { JoinGameDTO } from "../../application/dto/JoinGameDTO";
import { CreateGameDTO } from "../../application/dto/CreateGameDTO";

export default class RoomController {
    
    private roomService: RoomService;
    private authAdapter: IAuthAdapter;

    constructor (roomService: RoomService, authAdapter: IAuthAdapter) {
        this.roomService = roomService;
        this.authAdapter = authAdapter;
    }

    async createRoom(req: Request, res: Response): Promise<unknown> {
        const identity = this.authAdapter.verifyToken(req.headers.authorization || "");
        const userId = identity?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        try {
            const dto = req.body as CreateGameDTO;
            const gameCode = req.body.gameCode;
            await this.roomService.createRoom(gameCode, userId);
            res.status(201).json({ message: "Room created successfully" });
        } catch (error) {
            console.log("Error creating room:", error);
            res.status(500).json({ error: "Failed to create room" });
        }
    }

    async joinRoom(req: Request, res: Response): Promise<unknown> {
        const identity = this.authAdapter.verifyToken(req.headers.authorization || "");
        const userId = identity?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        try {
            const dto: JoinGameDTO = {gameCode: req.body.gameCode, userId:userId} as JoinGameDTO;
            const gameCode = dto.gameCode;
            await this.roomService.joinRoom(gameCode, userId);
            res.status(200).json({ message: "Joined room successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to join room" });
        }
    }
}