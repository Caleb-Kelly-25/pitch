import { NullExpression } from "mongoose";
import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Player } from "../domain/entities/Player";
import IGameStateRepository from "../domain/repositories/IGameStateRepository";
import IUserRepository from "../domain/repositories/IUserRepository";
import IGamePublisherPort from "../ports/IGamePublisherPort";
import { PlayerId } from "../types/id-declarations";
import { BidDTO } from "./dto/BidDTO";
import { PlayCardDTO } from "./dto/PlayCardDTO";
import { PlaceBid } from "./PlaceBid";
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

    async placeBid(bidDTO: BidDTO) {
        const { gameId, playerId, bidValue } = bidDTO;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) {
            console.log(`Game with ID ${gameId} not found.`);
            return false;
        }

        const newGameState: (GameState | null) = PlaceBid.placeBid(gameState, playerId as PlayerId, bidValue);

        if (!newGameState) {
            console.log(`Failed to place bid for player ${playerId} in game ${gameId}.`);
            return false;
        }

        await this.gameStateRepository.updateGameState(newGameState);
        await this.gamePub.publishGameStateToRoom(newGameState.id, newGameState);
        return true;
    }

    async playCard(playCardRequest: PlayCardDTO) {
        const { gameId, playerId, cardSuit, cardValue } = playCardRequest;

        // Grab the game state
        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) {
            console.log(`Game with ID ${gameId} not found.`);
            return false;
        }

        const newGameState: (GameState | null) = PlayCard.playCard(gameState, playerId as PlayerId, new Card(cardSuit, cardValue));
        if (!newGameState) {
            console.log(`Failed to play card for player ${playerId} in game ${gameId}.`);
            return false;
        }

        await this.gameStateRepository.updateGameState(newGameState);
        await this.gamePub.publishGameStateToRoom(newGameState.id, newGameState);
        return true;
    }

}