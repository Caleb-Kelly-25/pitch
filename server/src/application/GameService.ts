import IGameStateRepository from "../domain/repositories/IGameStateRepository";
import IUserRepository from "../domain/repositories/IUserRepository";

export class GameService {
    private gameStateRepository: IGameStateRepository;
    private userRepository: IUserRepository;

    constructor(gameStateRepository: IGameStateRepository, userRepository: IUserRepository) {
        this.gameStateRepository = gameStateRepository;
        this.userRepository = userRepository;
    }
}