import { NullExpression } from "mongoose";
import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Player } from "../domain/entities/Player";
import IGameStateRepository from "../domain/repositories/IGameStateRepository";
import IUserRepository from "../domain/repositories/IUserRepository";
import IGamePublisherPort from "../ports/IGamePublisherPort";
import { PlayerId } from "../types/id-declarations";
import { PlayCardDTO } from "./dto/PlayCardDTO";
import { PlayCard } from "./PlayCard";

export class GameService {
    private gameStateRepository: IGameStateRepository;
    private userRepository: IUserRepository;
    private gamePub: IGamePublisherPort;

    constructor(gameStateRepository: IGameStateRepository, userRepository: IUserRepository, gamePub: IGamePublisherPort) {
        this.gameStateRepository = gameStateRepository;
        this.userRepository = userRepository;
        this.gamePub = gamePub;
    }

    async playCard(playCardRequest: PlayCardDTO) {
        const { gameId, playerId, cardSuit, cardValue } = playCardRequest;

        // Grab the game state
        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) {
            return false;
        }

        const newGameState: (GameState | null) = PlayCard.playCard(gameState, playerId as PlayerId, new Card(cardSuit, cardValue));
        if (!newGameState) {
            return false;
        }

        await this.gameStateRepository.updateGameState(newGameState);
        await this.gamePub.publishGameStateToRoom(newGameState.id, newGameState);
        return true;
    }

}