import { Router } from "express";
import UserController from "./UserController";

export default function createRouter(userController: UserController): Router {
    const router = Router();
    router.get('/auth/signup', async (req, res) => userController.signup(req, res));
    router.post('/auth/login', async (req, res) => userController.login(req, res));
    router.get('/health', async (req, res) => {
        res.status(200).json({ status: "OK" });
    });
    return router;
}