import { Card } from "../domain/entities/Card";
import IGameStateRepository from "../domain/repositories/IGameStateRepository";
import { GameNotFoundError } from "../domain/errors/GameErrors";
import IGamePublisherPort from "../ports/IGamePublisherPort";
import { PlayerId } from "../types/id-declarations";
import { BidDTO } from "./dto/BidDTO";
import { PlayCardDTO } from "./dto/PlayCardDTO";
import { PickSuitDTO } from "./dto/PickSuitDTO";
import { BlindCardDTO } from "./dto/BlindCardDTO";
import { DiscardHandCardDTO } from "./dto/DiscardHandCardDTO";
import { placeBid } from "./PlaceBid";
import { playCard } from "./PlayCard";
import { pickSuit } from "./PickSuit";
import { processBlindCard } from "./BlindCard";
import { discardHandCard } from "./DiscardHandCard";

export class GameService {
    private gameStateRepository: IGameStateRepository;
    private gamePub: IGamePublisherPort;

    constructor(gameStateRepository: IGameStateRepository, gamePub: IGamePublisherPort) {
        this.gameStateRepository = gameStateRepository;
        this.gamePub = gamePub;
    }

    async placeBid(bidDTO: BidDTO): Promise<void> {
        const { gameId, playerId, bidAmount } = bidDTO;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        placeBid(gameState, playerId as PlayerId, bidAmount);

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);
    }

    async playCard(dto: PlayCardDTO): Promise<void> {
        const { gameId, playerId, cardSuit, cardValue } = dto;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        playCard(gameState, playerId as PlayerId, new Card(cardSuit, cardValue));

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);
    }

    async pickSuit(dto: PickSuitDTO): Promise<void> {
        const { gameId, playerId, suit } = dto;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        pickSuit(gameState, playerId as PlayerId, suit);

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);
    }

    async discardHandCard(dto: DiscardHandCardDTO): Promise<void> {
        const { gameId, playerId, cardSuit, cardValue } = dto;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        discardHandCard(gameState, playerId as PlayerId, cardSuit, cardValue);

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);
    }

    async blindCard(dto: BlindCardDTO): Promise<void> {
        const { gameId, playerId, action, swapSuit, swapValue } = dto;

        const gameState = await this.gameStateRepository.getGameStateById(gameId);
        if (!gameState) throw new GameNotFoundError(gameId);

        processBlindCard(gameState, playerId as PlayerId, action, swapSuit, swapValue);

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);
    }
}
