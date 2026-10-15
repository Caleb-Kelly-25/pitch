import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Hand } from "../domain/entities/Hand";
import { Player } from "../domain/entities/Player";
import { createWaitingHand, startBidding } from "../domain/entities/HandCycle";
import IUserRepository from "../domain/repositories/IUserRepository";
import IGamePublisherPort from "../ports/IGamePublisherPort";
import IShortTermStoragePort from "../ports/IShortTermStoragePort";
import { GameId, PlayerId, UserId } from "../types/id-declarations";
import { withGameState } from "./CasTransaction";
import crypto from "crypto";

const CARDS_PER_PLAYER = 9;

export class RoomService {
    private shortTermStorage: IShortTermStoragePort;
    private userRepository: IUserRepository;
    private publisher: IGamePublisherPort;
    private botTrigger?: (gs: GameState) => void;

    constructor(shortTermStorage: IShortTermStoragePort, userRepository: IUserRepository, publisher: IGamePublisherPort, botTrigger?: (gs: GameState) => void) {
        this.shortTermStorage = shortTermStorage;
        this.userRepository = userRepository;
        this.publisher = publisher;
        this.botTrigger = botTrigger;
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
        const existing = await this.shortTermStorage.getGameStateById(gameCode as GameId);
        if (!existing) throw new Error('Room not found');

        // Reconnecting player — just re-broadcast state. Nothing changes, so
        // this skips the write path rather than burning a version on a no-op.
        if (existing.players.some(p => p.id === userId)) {
            this.publisher.publishGameStateToRoom(existing.id, existing);
            return;
        }

        if (existing.players.length >= 4) throw new Error('Room is full');

        // Looked up once, outside the loop — it does not depend on game state.
        const user = await this.userRepository.findById(userId as UserId);
        if (!user) throw new Error('User not found');

        const game = await withGameState(this.shortTermStorage, gameCode, (gs) => {
            // The checks above raced. Re-run them against the state this
            // attempt actually read: a concurrent join may have taken the last
            // seat, or seated this same user (double-clicked join button).
            if (gs.players.some(p => p.id === userId)) return;
            if (gs.players.length >= 4) throw new Error('Room is full');

            const seatNumber = gs.players.length + 1;
            gs.players.push(new Player(userId as PlayerId, user.username, userId as UserId, new Hand([]), false, true, false, 0, seatNumber));

            if (gs.players.length === 4) {
                this.startGame(gs);
            }
        });

        this.publisher.publishGameStateToRoom(game.id, game);
    }

    async addBot(gameCode: string): Promise<void> {
        const existing = await this.shortTermStorage.getGameStateById(gameCode as GameId);
        if (!existing) throw new Error('Room not found');
        if (existing.players.length >= 4) throw new Error('Room is full');

        const game = await withGameState(this.shortTermStorage, gameCode, (gs) => {
            // Authoritative seat check — the pre-check above may be stale
            if (gs.players.length >= 4) throw new Error('Room is full');

            const botId = ('bot-' + crypto.randomUUID()) as PlayerId;
            const botNumber = gs.players.filter(p => p.isBot).length + 1;
            const seatNumber = gs.players.length + 1;
            const bot = new Player(botId, `Bot ${botNumber}`, botId as unknown as UserId, new Hand([]), false, true, false, 0, seatNumber, true);
            gs.players.push(bot);

            if (gs.players.length === 4) {
                this.startGame(gs);
            }
        });

        this.publisher.publishGameStateToRoom(game.id, game);

        if (game.players.length === 4 && this.botTrigger) {
            this.botTrigger(game);
        }
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
