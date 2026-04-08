import {Server, Socket} from "socket.io";
import IAuthAdapter from "../auth/IAuthAdapter";
import { GameService } from "../../application/GameService";
import { BidDTO } from "../../application/dto/BidDTO";
import { PlayCardDTO } from "../../application/dto/PlayCardDTO";
import { IdentityPayload } from "../auth/IdentityPayload";


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

        socket.on("PlaceBidEvent", (data) =>{this.onPlaceBidEvent(socket.user, data)});

        socket.on("PlayCardEvent", (data) => {this.onPlayCardEvent(socket.user, data)});

        socket.join(`player:${socket.user.userId}`);
    }
    
    disconnect(socket: Socket) {
        console.log("Socket disconnected!");
    }

    onPlaceBidEvent(user: IdentityPayload, data: string) {
        console.log("Place bid detected");
        const parsedData = JSON.parse(data);
        //Validation that frontend sent all necessary data
        if (!parsedData.gameId || parsedData.bidValue === undefined) {
            console.error("Invalid PlaceBidEvent data:", data);
            return;
        }

        const dto = new BidDTO(parsedData.gameId, user.userId, parsedData.bidValue);

        this.gameService.placeBid(dto).then(success => {
            if (!success) {
                console.log("Invalid attempt to place bid:", data);
            }
        }).catch(err => {
            console.error("Error processing PlaceBidEvent:", err);
        });
    }

    onPlayCardEvent(user: IdentityPayload, data: string){
        console.log("Play card detected");
        const parsedData = JSON.parse(data);
        if (!parsedData.gameId || !parsedData.suit || !parsedData.value) {
            console.error("Invalid PlayCardEvent data:", data);
            return;
        }
        const dto = new PlayCardDTO(parsedData.gameId, user.userId, parsedData.suit, parsedData.value);
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
