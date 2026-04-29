import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Hand } from "../domain/entities/Hand";
import { Player } from "../domain/entities/Player";
import { createWaitingHand, startBidding } from "../domain/entities/HandCycle";
import IUserRepository from "../domain/repositories/IUserRepository";
import IGamePublisherPort from "../ports/IGamePublisherPort";
import IShortTermStoragePort from "../ports/IShortTermStoragePort";
import { GameId, PlayerId, UserId } from "../types/id-declarations";

const CARDS_PER_PLAYER = 9;

export class RoomService {
    private shortTermStorage: IShortTermStoragePort;
    private userRepository: IUserRepository;
    private publisher: IGamePublisherPort;

    constructor(shortTermStorage: IShortTermStoragePort, userRepository: IUserRepository, publisher: IGamePublisherPort) {
        this.shortTermStorage = shortTermStorage;
        this.userRepository = userRepository;
        this.publisher = publisher;
    }

    async createRoom(gameCode: string, userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId as UserId);
        if (!user) throw new Error('User not found');

        const player = new Player(userId as PlayerId, user.username, userId as UserId, new Hand([]), false, true, false, 0, 1);
        // gameCode serves as the gameId so clients can look up their game by the code they joined with
        const newGame = new GameState(
            gameCode as GameId,
            [player],
            gameCode,
            createWaitingHand(userId as PlayerId),
            0,
            0,
        );
        await this.shortTermStorage.createGameState(newGame);
        await this.publisher.publishGameStateToRoom(newGame.id, newGame);
    }

    async joinRoom(gameCode: string, userId: string): Promise<void> {
        const game = await this.shortTermStorage.getGameStateById(gameCode as GameId);
        if (!game) throw new Error('Room not found');

        // Reconnecting player — just re-broadcast state
        if (game.players.some(p => p.id === userId)) {
            this.publisher.publishGameStateToRoom(game.id, game);
            return;
        }

        if (game.players.length >= 4) throw new Error('Room is full');

        const user = await this.userRepository.findById(userId as UserId);
        if (!user) throw new Error('User not found');

        const seatNumber = game.players.length + 1;
        game.players.push(new Player(userId as PlayerId, user.username, userId as UserId, new Hand([]), false, true, false, 0, seatNumber));

        if (game.players.length === 4) {
            this.startGame(game);
        }

        await this.shortTermStorage.updateGameState(game);
        this.publisher.publishGameStateToRoom(game.id, game);
    }

    private startGame(game: GameState): void {
        const dealerIndex = Math.floor(Math.random() * game.players.length);
        game.players[dealerIndex].isDealer = true;
        const dealerId = game.players[dealerIndex].id;

        const newHand = startBidding(createWaitingHand(dealerId), game.players);

        const deck = Card.createFullDeck();
        for (const player of game.players) {
            for (let i = 0; i < CARDS_PER_PLAYER; i++) {
                player.hand.cards.push(deck.pop() as Card);
            }
        }
        newHand.blindCards = deck;

        game.handCycle = newHand;
    }
}
