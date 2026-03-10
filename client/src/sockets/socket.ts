import { io, Socket } from "socket.io-client";
import { registerGameSocketHandlers } from "../features/game/registerGameSocketHandlers";

export let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket) {
    return socket;
  }
console.log("Connecting socket with token: ", token);

  socket = io("http://localhost:3000", {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
  });

  registerGameSocketHandlers(socket);

  return socket;
}

export function playCard(suit: string, value: string) {
  socket?.emit("playCard", JSON.stringify({ suit, value }));
}
