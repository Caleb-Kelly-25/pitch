import {Server, Socket} from "socket.io";
import IAuthAdapter from "../auth/IAuthAdapter";
import { GameService } from "../../application/GameService";
import { PlayCardDTO } from "../../application/dto/PlayCardDTO";


export default class WebSocketController {
    private wss: Server;
    private authAdapter: IAuthAdapter;
    private gameService: GameService;

    constructor (wss: Server, authAdapter: IAuthAdapter, gameService: GameService) {
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
        console.log("Performing authorization for token:", token);

        if (!token) return next(new Error("Unauthorized"));

        try {
            const payload = this.authAdapter.verifyToken(token);
            socket.user = payload; // safe: JWT is trusted
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    }

    registerSocketHandlers(socket: Socket) {
        socket.on("disconnect", () => this.disconnect(socket));

        socket.on("MessageEvent", (messageText) => this.onMessageEvent(messageText));

        socket.on("PlayCardEvent", (data) => this.onPlayCardEvent(data));
    }
    
    disconnect(socket: Socket) {
        console.log("Socket disconnected!");
    }

    onPlayCardEvent(data: string){
        const parsedData = JSON.parse(data);
        if (!parsedData.gameId || !parsedData.playerId || !parsedData.cardSuit || !parsedData.cardValue) {
            console.error("Invalid PlayCardEvent data:", data);
            return;
        }
        const dto = new PlayCardDTO(parsedData.gameId, parsedData.playerId, parsedData.cardSuit, parsedData.cardValue);
        this.gameService.playCard(dto).then(success => {
            if (!success) {
                console.log("Invalid attempt to play card:", data);
            }
        }).catch(err => {
            console.error("Error processing PlayCardEvent:", err);
        });

    }

    onMessageEvent(messageText: string) {
        console.log("Message received from socket: " + messageText);
    }
    
}
