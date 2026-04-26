import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { placeBid, pickSuit, blindCard, discardHandCard } from "./gameService"
import { gameSlice } from "./gameSlice"

export function useGame() {
  const game = useAppSelector((s) => s.game)
  const dispatch = useAppDispatch()

  return {
    ...game,
    placeBid: (amount: number) => placeBid(amount, game.gameId),
    pickSuit: (suit: string) => pickSuit(suit, game.gameId),
    blindCard: (action: 'keep' | 'discard' | 'swap' | 'done', swapSuit?: string, swapValue?: number) =>
      blindCard(action, game.gameId, swapSuit, swapValue),
    discardHandCard: (suit: string, value: number) => discardHandCard(suit, value, game.gameId),
    confirmOverlay: () => dispatch(gameSlice.actions.confirmOverlay()),
  }
}
