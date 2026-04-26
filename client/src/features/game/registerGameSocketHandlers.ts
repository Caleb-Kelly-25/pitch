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

    const handJustEnded =
      current.phase === "PLAYING" &&
      data.phase !== "PLAYING"

    if (trickJustCompleted) {
      // Use the server's completed trick snapshot (includes the 4th card)
      const playedCards: { playerId: string; card: any }[] =
        data.lastCompletedTrick ?? []

      store.dispatch(gameSlice.actions.setTrickResult({
        playedCards,
        winnerId: data.trick?.leadPlayerId ?? "",
      }))
      store.dispatch(gameSlice.actions.setPendingGameState(data))

    } else if (handJustEnded) {
      // Capture the hand result from the last PLAYING state before it's replaced
      const lhr = data.lastHandResult ?? null
      if (lhr) {
        store.dispatch(gameSlice.actions.setHandResult(lhr))
        store.dispatch(gameSlice.actions.setPendingGameState(data))
      } else {
        store.dispatch(gameSlice.actions.setGameState(data))
      }

    } else {
      store.dispatch(gameSlice.actions.setGameState(data))
    }
  })
}
