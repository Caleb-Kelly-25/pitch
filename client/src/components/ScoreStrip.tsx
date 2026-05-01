import { motion } from "motion/react"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { SUIT_SYMBOLS } from "../features/game/constants"
import styles from "../styles/game.module.css"

const scoreSpring = { type: "spring", stiffness: 340, damping: 22 } as const

export default function ScoreStrip() {
  const game = useGame()
  const auth = useAuth()

  const myIndex = game.players.findIndex(p => p.id === auth.user?.id)
  const onMyTeam = (_: unknown, i: number) => i % 2 === myIndex % 2
  const teamA = game.players.filter(onMyTeam)
  const teamB = game.players.filter((_, i) => i % 2 !== myIndex % 2)
  const ourScore   = myIndex % 2 === 0 ? game.ourScore   : game.theirScore
  const theirScore = myIndex % 2 === 0 ? game.theirScore : game.ourScore

  const trumpDisplay = game.leadSuit ?? game.trumpSuit
  const suitLabel = trumpDisplay
    ? `${SUIT_SYMBOLS[trumpDisplay]} ${trumpDisplay.charAt(0) + trumpDisplay.slice(1).toLowerCase()}`
    : "—"

  return (
    <div className={styles.scoreStrip}>
      <div className={styles.scoreTeam}>
        <span style={{ fontWeight: "bold" }}>
          Us ·{" "}
          <motion.span key={ourScore} initial={{ scale: 1.5, color: "#f5c06a" }} animate={{ scale: 1, color: "#f5ede0" }} transition={scoreSpring} style={{ display: "inline-block" }}>
            {ourScore}
          </motion.span>
        </span>
        <span>{teamA.map(p => p.username).join(" & ")}</span>
      </div>

      <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem", opacity: 0.95 }}>
        {(game.phase === "PLAYING" || game.phase === "BLIND_CARDS") && (
          <span>Trick {game.trickNumber + 1}</span>
        )}
        <span>Trump: {suitLabel}</span>
        {game.phase === "PLAYING" && (
          <span>Bid Winner: {game.players.find(p => p.id === game.bidWinnerId)?.username}</span>
        )}
      </div>

      <div className={styles.scoreTeam}>
        <span style={{ fontWeight: "bold" }}>
          Them ·{" "}
          <motion.span key={theirScore} initial={{ scale: 1.5, color: "#f5c06a" }} animate={{ scale: 1, color: "#f5ede0" }} transition={scoreSpring} style={{ display: "inline-block" }}>
            {theirScore}
          </motion.span>
        </span>
        <span>{teamB.map(p => p.username).join(" & ")}</span>
      </div>
    </div>
  )
}
