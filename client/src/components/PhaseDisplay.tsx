import { useGame } from "../features/game/useGame"
import GameTable from "./GameTable"
import WaitingPhase from "./WaitingPhase"
import BiddingPhase from "./BiddingPhase"
import TrumpSelectionPhase from "./TrumpSelectionPhase"
import BlindCardsPhase from "./BlindCardsPhase"
import GameOverOverlay from "./GameOverOverlay"

export default function PhaseDisplay() {
  const { phase } = useGame()

  if (phase === "WAITING") return <WaitingPhase />

  if (phase === "BIDDING") return (
    <>
      <GameTable />
      <BiddingPhase />
    </>
  )

  if (phase === "TRUMP_SELECTION") return (
    <>
      <GameTable />
      <TrumpSelectionPhase />
    </>
  )

  if (phase === "BLIND_CARDS") return (
    <>
      <GameTable />
      <BlindCardsPhase />
    </>
  )

  if (phase === "PLAYING") return <GameTable />

  if (phase === "COMPLETE") return <GameOverOverlay />

  return null
}
