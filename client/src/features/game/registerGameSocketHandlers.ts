import { store } from "../../application/store"
import type { Socket } from "socket.io-client"
import { setGameState } from "./gameSlice"

export function registerGameSocketHandlers(socket: Socket) {

  socket.on("gameStateUpdate", (msg: any) => {
    store.dispatch(setGameState(msg))
  })

}