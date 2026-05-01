import { useEffect, useRef } from "react"
import { useGame } from "../features/game/useGame"
import { useSounds } from "../hooks/useSounds"

export default function SoundEngine() {
  const game = useGame()
  const { playCard, playTrickWin, playShuffle } = useSounds()

  const prevPlayedCount = useRef(0)
  const prevPhase = useRef(game.phase)
  const prevTrickResult = useRef(game.trickResult)

  useEffect(() => {
    const n = game.trick.playedCards.length
    if (n > 0 && n > prevPlayedCount.current) playCard()
    prevPlayedCount.current = n
  }, [game.trick.playedCards.length, playCard])

  useEffect(() => {
    if (game.trickResult && !prevTrickResult.current) playTrickWin()
    prevTrickResult.current = game.trickResult
  }, [game.trickResult, playTrickWin])

  useEffect(() => {
    if (game.phase === "BIDDING" && prevPhase.current !== "BIDDING") playShuffle()
    prevPhase.current = game.phase
  }, [game.phase, playShuffle])

  return null
}
