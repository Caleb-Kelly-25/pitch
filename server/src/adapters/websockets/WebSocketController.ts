import {Server, Socket} from "socket.io";
import IAuthAdapter from "../auth/IAuthAdapter";


export default class WebSocketController {
    private wss: Server;
    private authAdapter: IAuthAdapter;

    constructor (wss: Server, authAdapter: IAuthAdapter) {
        this.wss = wss;
        this.authAdapter = authAdapter;

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
    }
    
    disconnect(socket: Socket) {
        console.log("Socket disconnected!");
    }

    onMessageEvent(messageText: string) {
        console.log("Message received from socket: " + messageText);
    }
    
}
