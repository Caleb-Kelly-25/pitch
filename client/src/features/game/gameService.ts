import { socket } from "../../sockets/socket";

export function playCard(suit: string, rank: string) {
    if (!socket) {
        throw new Error("Socket not connected, can't play card.");
    } else {
        socket.emit("playCard", { suit, rank });
    }
}