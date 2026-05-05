import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { CardChip } from "./TakenCardsStrip"
import { useCountUp } from "../hooks/useCountUp"
import { sumPoints } from "../features/game/scoreUtils"
import styles from "../styles/game.module.css"

const NO_CARDS = <span style={{ color: "rgba(245,237,224,0.4)", fontSize: 13 }}>No point cards</span>

export default function HandResultOverlay() {
  const game = useGame()
  const auth = useAuth()
  const { handResult } = game

  const myId = auth.user?.id
  const myIndex = game.players.findIndex(p => p.id === myId)
  const ourCardsWon   = handResult ? (myIndex % 2 === 0 ? handResult.teamOneCardsWon : handResult.teamTwoCardsWon) : []
  const theirCardsWon = handResult ? (myIndex % 2 === 0 ? handResult.teamTwoCardsWon : handResult.teamOneCardsWon) : []

  const ourPtsTarget   = sumPoints(ourCardsWon)
  const theirPtsTarget = sumPoints(theirCardsWon)
  const ourPts   = useCountUp(ourPtsTarget)
  const theirPts = useCountUp(theirPtsTarget)

  if (!handResult) return null

  const bidWinnerIndex = game.players.findIndex(p => p.id === handResult.bidWinnerId)
  const bidderOnOurTeam = myIndex >= 0 && bidWinnerIndex >= 0 && myIndex % 2 === bidWinnerIndex % 2
  const bidderPtsTarget = bidderOnOurTeam ? ourPtsTarget : theirPtsTarget
  const bidMade = bidderPtsTarget >= handResult.bidAmount

  const teamLabel = (pts: number, isUs: boolean) => {
    const members = game.players.filter((_, i) => isUs ? i % 2 === myIndex % 2 : i % 2 !== myIndex % 2)
    return `${isUs ? "Us" : "Them"} (${members.map(p => p.username).join(" & ")}): ${pts} pt${pts !== 1 ? "s" : ""}`
  }

  return (
    <div className={styles.trickOverlay} style={{ gap: 20, padding: "24px 32px" }}>
      <div style={{ color: "#f5ede0", fontSize: "1.5rem", fontWeight: "bold" }}>Hand Over</div>

      <div style={{ fontSize: "0.95rem", color: bidMade ? "#7dcd7d" : "#e07777", fontStyle: "italic" }}>
        Bid {handResult.bidAmount} — {bidderOnOurTeam ? "Us" : "Them"} {bidMade ? "made it" : "were set"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ color: "#f5ede0", fontSize: "0.9rem" }}>{teamLabel(ourPts, true)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {ourCardsWon.length === 0 ? NO_CARDS : ourCardsWon.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)}
        </div>
      </div>

      <div style={{ width: "80%", height: 1, backgroundColor: "rgba(245,237,224,0.15)" }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ color: "#f5ede0", fontSize: "0.9rem" }}>{teamLabel(theirPts, false)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {theirCardsWon.length === 0 ? NO_CARDS : theirCardsWon.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)}
        </div>
      </div>

      <button className={styles.button} style={{ fontSize: "1.1rem", padding: "10px 32px", marginTop: 4 }} onClick={game.confirmOverlay}>
        OK
      </button>
    </div>
  )
}
