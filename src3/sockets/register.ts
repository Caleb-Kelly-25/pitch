import { DefaultEventsMap, Server, Socket } from "socket.io"
import { registerJoinGame } from "./join";

export function registerSocketHandlers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    registerJoinGame(socket);
}
