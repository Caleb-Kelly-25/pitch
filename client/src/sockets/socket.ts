import { io, Socket } from "socket.io-client";
import { registerGameSocketHandlers } from "../features/game/registerGameSocketHandlers";

export let socket: Socket | null = null;

export function connectSocket(token: string) {
console.log("Connecting socket with token: ", token);

  socket = io("http://localhost:3000", {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
  });

  registerGameSocketHandlers(socket);

  return socket;
}
