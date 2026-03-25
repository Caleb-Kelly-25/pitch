import { Router } from "express";
import UserController from "./UserController";
import RoomController from "./RoomController";

export default function createRouter(userController: UserController, roomController: RoomController): Router {
    const router = Router();
    router.post('/auth/signup', async (req, res) => userController.signup(req, res));
    router.post('/auth/login', async (req, res) => userController.login(req, res));
    router.get('/health', async (req, res) => {
        res.status(200).json({ status: "OK" });
    });

    router.post('/game/create', async (req, res) => roomController.createRoom(req, res));
    router.post('/game/join', async (req, res) => roomController.joinRoom(req, res));

    return router;
}