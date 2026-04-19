import { BiddingCycle } from "../domain/entities/BiddingCycle";
import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Hand } from "../domain/entities/Hand";
import { HandCycle } from "../domain/entities/HandCycle";
import { Player } from "../domain/entities/Player";
import { Trick } from "../domain/entities/Trick";
import { HandCycleStatus } from "../domain/enums/HandCycleStatus";
import { Suit } from "../domain/enums/Suit";
import IUserRepository from "../domain/repositories/IUserRepository";
import GamePublisherPort from "../ports/IGamePublisherPort";
import IShortTermStoragePort from "../ports/IShortTermStoragePort";
import { GameId, PlayerId, UserId } from "../types/id-declarations";
import { GameService } from "./GameService";
import UserService from "./UserService";

export class RoomService {
    
    shortTermStorage: IShortTermStoragePort;
    userRepository: IUserRepository;
    publisher: GamePublisherPort;

    constructor(shortTermStorage: IShortTermStoragePort, userRepository: IUserRepository, publisher: GamePublisherPort) {
        this.shortTermStorage = shortTermStorage;
        this.userRepository = userRepository;
        this.publisher = publisher;
    }

    async createRoom(gameCode: string, userId: string) {

        console.log(`Creating room with gameCode: ${gameCode} and userId: ${userId}`);
        const username = (await this.userRepository.findById(userId as UserId))?.username;
        if (!username) {
            throw new Error("User not found");
        }
        const newRoom = new GameState(gameCode as GameId,
            [new Player(userId as PlayerId, username, userId as UserId, new Hand([]), false, false, false, 0, 0)],
            gameCode,
            new HandCycle(userId as PlayerId,
                "" as PlayerId, 0, Suit.HEARTS,
                [],
                HandCycleStatus.WAITING,
                0,
                0,
                new BiddingCycle(userId as PlayerId, null, 0, {}),
                new Trick(0, userId as PlayerId, {} as Record<PlayerId, Card | null>, userId as PlayerId)),
            0,
            0);
        await this.shortTermStorage.createGameState(newRoom);
        const user = await this.userRepository.findById(userId as UserId);
        if(!user) {
            throw new Error("User not found");
        }
        await this.userRepository.updateUser(user);  
    }

    async joinRoom(gameCode: string, userId: string) {
        console.log(`Joining room with code ${gameCode} and user id ${userId}`)
        const room = (await this.shortTermStorage.getGameStateById(gameCode as GameId)) as GameState | null;
        if (!room) {
            console.log(await this.shortTermStorage.getAllGameStates());
            throw new Error("Room not found");
        }
        if (room.players.length >= 4 && !room.players.some(p => p.id === userId)) {
            throw new Error("Room is full");
        } else {
            const username = (await this.userRepository.findById(userId as UserId))?.username;
            if (!username) {
                throw new Error("User not found");
            }
            const newPlayer = new Player(userId as PlayerId, username, userId as UserId, new Hand([]), false, false, false, 0, 0);
            if (!room.players.some(p => p.id === userId)) {
                    room.players.push(newPlayer);
                
                    await this.shortTermStorage.updateGameState(room);
                

                //UPDATE: change this to call a createHandCycle method instead of hardcoding
                // Also need to make a newHandCycle method in GameState or HandCycle
                // If the room is now full, we can initialize the hand cycle and start the game
                if (room.players.length === 4) {
                    //randomly select a dealer and initialize the handCycle
                    const randomDealerId = room.players[Math.floor(Math.random() * room.players.length)].id;
                    room.initializeHandCycle(randomDealerId);

                    room.handCycle.nextStatus(room); //this will transition the hand cycle from waiting to dealing and deal the cards to players
                    await this.shortTermStorage.updateGameState(room);
                }
            }
            
            this.publisher.publishGameStateToRoom(room.id, room);
        }
    }

}