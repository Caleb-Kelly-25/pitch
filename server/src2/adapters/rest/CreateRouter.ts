import { Router } from "express";
import UserController from "./UserController";

export default function createRouter(userController: UserController): Router {
    const router = Router();
    router.get('/', userController.getAllUsers);
    router.post('/', userController.createUser);
    router.get('/:id', userController.getUserById);
    return router;
}