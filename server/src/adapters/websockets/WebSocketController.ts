import { Server, Socket } from "socket.io";
import IAuthAdapter from "../auth/IAuthAdapter";
import { GameService } from "../../application/GameService";
import { BidDTO } from "../../application/dto/BidDTO";
import { PlayCardDTO } from "../../application/dto/PlayCardDTO";
import { PickSuitDTO } from "../../application/dto/PickSuitDTO";
import { BlindCardDTO } from "../../application/dto/BlindCardDTO";
import { DiscardHandCardDTO } from "../../application/dto/DiscardHandCardDTO";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { IdentityPayload } from "../auth/IdentityPayload";

export default class WebSocketController {
    private wss: Server;
    private authAdapter: IAuthAdapter;
    private gameService: GameService;

    constructor(wss: Server, authAdapter: IAuthAdapter, gameService: GameService) {
        this.wss = wss;
        this.authAdapter = authAdapter;
        this.gameService = gameService;

        this.wss.use((socket, next) => this.socketAuth(socket, next));

        this.wss.on("connection", (socket: Socket) => {
            console.log("Socket connected!");
            this.registerSocketHandlers(socket);
        });
    }

    socketAuth(socket: Socket, next: (err?: Error) => void) {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Unauthorized"));

        try {
            socket.user = this.authAdapter.verifyToken(token);
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    }

    registerSocketHandlers(socket: Socket) {
        socket.on("disconnect", () => console.log("Socket disconnected!"));
        socket.on("PlaceBidEvent", (data) => this.onPlaceBidEvent(socket.user, data));
        socket.on("PlayCardEvent", (data) => this.onPlayCardEvent(socket.user, data));
        socket.on("PickSuitEvent", (data) => this.onPickSuitEvent(socket.user, data));
        socket.on("BlindCardEvent", (data) => this.onBlindCardEvent(socket.user, data));
        socket.on("DiscardHandCardEvent", (data) => this.onDiscardHandCardEvent(socket.user, data));
        socket.join(`player:${socket.user.userId}`);
    }

    async onPlaceBidEvent(user: IdentityPayload, data: string) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch {
            console.error("PlaceBidEvent: malformed JSON", data);
            return;
        }

        if (!parsedData.gameId || parsedData.bidAmount === undefined) {
            console.error("PlaceBidEvent: missing required fields", parsedData);
            return;
        }

        try {
            await this.gameService.placeBid(new BidDTO(parsedData.gameId, user.userId, parsedData.bidAmount));
        } catch (err) {
            console.error("PlaceBidEvent error:", err instanceof Error ? err.message : err);
        }
    }

    async onPlayCardEvent(user: IdentityPayload, data: string) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch {
            console.error("PlayCardEvent: malformed JSON", data);
            return;
        }

        if (!parsedData.gameId || parsedData.suit === undefined || parsedData.value === undefined) {
            console.error("PlayCardEvent: missing required fields", parsedData);
            return;
        }

        try {
            await this.gameService.playCard(new PlayCardDTO(parsedData.gameId, user.userId, parsedData.suit, parsedData.value));
        } catch (err) {
            console.error("PlayCardEvent error:", err instanceof Error ? err.message : err);
        }
    }

    async onPickSuitEvent(user: IdentityPayload, data: string) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch {
            console.error("PickSuitEvent: malformed JSON", data);
            return;
        }

        if (!parsedData.gameId || !parsedData.suit) {
            console.error("PickSuitEvent: missing required fields", parsedData);
            return;
        }

        if (!Object.values(Suit).includes(parsedData.suit)) {
            console.error("PickSuitEvent: invalid suit", parsedData.suit);
            return;
        }

        try {
            await this.gameService.pickSuit(new PickSuitDTO(parsedData.gameId, user.userId, parsedData.suit as Suit));
        } catch (err) {
            console.error("PickSuitEvent error:", err instanceof Error ? err.message : err);
        }
    }

    async onDiscardHandCardEvent(user: IdentityPayload, data: string) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch {
            console.error("DiscardHandCardEvent: malformed JSON", data);
            return;
        }

        if (!parsedData.gameId || !parsedData.suit || parsedData.value === undefined) {
            console.error("DiscardHandCardEvent: missing required fields", parsedData);
            return;
        }

        if (!Object.values(Suit).includes(parsedData.suit) || !Object.values(Value).includes(parsedData.value)) {
            console.error("DiscardHandCardEvent: invalid suit or value", parsedData);
            return;
        }

        try {
            await this.gameService.discardHandCard(new DiscardHandCardDTO(parsedData.gameId, user.userId, parsedData.suit as Suit, parsedData.value as Value));
        } catch (err) {
            console.error("DiscardHandCardEvent error:", err instanceof Error ? err.message : err);
        }
    }

    async onBlindCardEvent(user: IdentityPayload, data: string) {
        let parsedData: any;
        try {
            parsedData = JSON.parse(data);
        } catch {
            console.error("BlindCardEvent: malformed JSON", data);
            return;
        }

        const validActions = ['keep', 'discard', 'swap', 'done'];
        if (!parsedData.gameId || !validActions.includes(parsedData.action)) {
            console.error("BlindCardEvent: missing or invalid fields", parsedData);
            return;
        }

        try {
            await this.gameService.blindCard(new BlindCardDTO(
                parsedData.gameId,
                user.userId,
                parsedData.action,
                parsedData.swapSuit,
                parsedData.swapValue,
            ));
        } catch (err) {
            console.error("BlindCardEvent error:", err instanceof Error ? err.message : err);
        }
    }
}
