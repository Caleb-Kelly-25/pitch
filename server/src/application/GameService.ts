import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { PlayingHand } from "../domain/entities/HandCycle";
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
import UserProfileService from "./UserProfileService";

export class GameService {
    private gameStateRepository: IGameStateRepository;
    private gamePub: IGamePublisherPort;
    private profileService?: UserProfileService;

    constructor(
        gameStateRepository: IGameStateRepository,
        gamePub: IGamePublisherPort,
        profileService?: UserProfileService,
    ) {
        this.gameStateRepository = gameStateRepository;
        this.gamePub = gamePub;
        this.profileService = profileService;
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

        // Snapshot before mutation so we can detect what changed
        const isPlaying = gameState.handCycle.phase === 'playing';
        const prevHand = isPlaying ? (gameState.handCycle as PlayingHand) : null;
        const prevTrickRound = prevHand?.trick.roundNumber ?? -1;

        playCard(gameState, playerId as PlayerId, new Card(cardSuit, cardValue));

        await this.gameStateRepository.updateGameState(gameState);
        this.gamePub.publishGameStateToRoom(gameState.id, gameState);

        if (this.profileService && prevHand) {
            this.recordStats(gameState, prevHand, prevTrickRound, playerId as PlayerId);
        }
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

    // --- Stat tracking (fire-and-forget) ---

    private recordStats(
        gameState: GameState,
        prevHand: PlayingHand,
        prevTrickRound: number,
        playerId: PlayerId,
    ): void {
        // advanceTrick always increments trick.roundNumber, so this is reliable
        const trickCompleted = prevHand.trick.roundNumber > prevTrickRound;

        // Card played: non-null slot in completed trick or in-progress trick
        const cardInSlot = trickCompleted
            ? prevHand.lastCompletedTrick?.[playerId]
            : prevHand.trick.cardsPlayed[playerId];

        if (cardInSlot !== null && cardInSlot !== undefined) {
            this.fire(this.profileService!.recordCardPlayed(this.getUserId(gameState, playerId)));
        }

        if (!trickCompleted) return;

        // trick.startingPlayerId after advanceTrick = winner of the trick that just completed
        const trickWinnerId = prevHand.trick.startingPlayerId;
        const trickCards = prevHand.lastCompletedTrick!;

        for (const player of gameState.players) {
            if (trickCards[player.id] === null || trickCards[player.id] === undefined) continue;
            this.fire(this.profileService!.recordTrick(player.userId, player.id === trickWinnerId));
        }

        const handEnded = gameState.handCycle.phase !== 'playing';
        if (!handEnded) return;

        // Bid outcome: only the bid winner gets a bid recorded
        const result = gameState.lastHandResult!;
        const bidWinnerIdx = gameState.players.findIndex(p => p.id === result.bidWinnerId);
        const biddingTeamPoints = bidWinnerIdx % 2 === 0
            ? prevHand.teamOneHandPoints
            : prevHand.teamTwoHandPoints;
        const bidMet = biddingTeamPoints >= result.bidAmount;
        const bidWinner = gameState.players[bidWinnerIdx];
        this.fire(this.profileService!.recordBid(bidWinner.userId, bidMet));

        // Game completion: only fires when handCycle is 'complete' (game won)
        if (gameState.handCycle.phase !== 'complete') return;

        const winningTeamIsEven = bidWinnerIdx % 2 === 0;
        for (let i = 0; i < gameState.players.length; i++) {
            const won = winningTeamIsEven ? i % 2 === 0 : i % 2 !== 0;
            this.fire(this.profileService!.recordGameCompleted(gameState.players[i].userId, won));
        }
    }

    private getUserId(gameState: GameState, playerId: PlayerId): string {
        return gameState.players.find(p => p.id === playerId)?.userId ?? "";
    }

    private fire(promise: Promise<void>): void {
        promise.catch(err => console.error("Profile stat error:", err));
    }
}
