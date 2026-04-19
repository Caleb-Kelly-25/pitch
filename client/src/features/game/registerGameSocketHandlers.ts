import { store } from "../../app/store"
import type { Socket } from "socket.io-client"
import { gameSlice } from "./gameSlice"

export function registerGameSocketHandlers(socket: Socket) {
  socket.on("gameStateUpdate", (data: any) => {
    const current = store.getState().game

    const trickJustCompleted =
      current.phase === "PLAYING" &&
      data.phase === "PLAYING" &&
      typeof data.trickNumber === "number" &&
      data.trickNumber > current.trickNumber

    if (trickJustCompleted) {
      store.dispatch(gameSlice.actions.setTrickResult({
        trick: current.trick,
        winnerId: data.trick?.leadPlayerId ?? "",
      }))
      store.dispatch(gameSlice.actions.setPendingGameState(data))
    } else {
      store.dispatch(gameSlice.actions.setGameState(data))
    }
  })
}
