import { Router } from "express";
import UserController from "./UserController";
import RoomController from "./RoomController";
import ProfileController from "./ProfileController";

export default function createRouter(
    userController: UserController,
    roomController: RoomController,
    profileController: ProfileController,
): Router {
    const router = Router();

    router.post('/auth/signup', async (req, res) => userController.signup(req, res));
    router.post('/auth/login',  async (req, res) => userController.login(req, res));

    router.get('/health', async (_req, res) => {
        res.status(200).json({ status: "OK" });
    });

    router.post('/game/create',  async (req, res) => roomController.createRoom(req, res));
    router.post('/game/join',    async (req, res) => roomController.joinRoom(req, res));
    router.post('/game/addBot',  async (req, res) => roomController.addBot(req, res));

    router.get('/profile/:userId', async (req, res) => profileController.getProfile(req, res));
    router.get('/leaderboard',    async (req, res) => profileController.getLeaderboard(req, res));

    return router;
}
