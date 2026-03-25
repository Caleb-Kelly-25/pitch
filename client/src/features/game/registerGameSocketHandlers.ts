import { store } from "../../application/store"
import type { Socket } from "socket.io-client"
import { setGameState } from "./gameSlice"

export function registerGameSocketHandlers(socket: Socket) {
  socket.on("gameStateUpdate", (data: any) => {
    console.log("Received game state update:", data);
    // data is now the PlayerViewResponseDTO object
    store.dispatch(setGameState(data));
  });
}