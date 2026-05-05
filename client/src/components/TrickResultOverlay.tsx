import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import Card from "./Card"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import styles from "../styles/game.module.css"

// Sweep direction toward the winner's seat (relative to viewer's bottom position)
const SWEEP_VECTORS = [
  { x: 0,    y: 500  },
  { x: -600, y: 0    },
  { x: 0,    y: -500 },
  { x: 600,  y: 0    },
]

export default function TrickResultOverlay() {
  const game = useGame()
  const auth = useAuth()
  const { trickResult } = game
  const [dismissing, setDismissing] = useState(false)

  const myId = auth.user?.id
  const myIndex = game.players.findIndex(p => p.id === myId)
  const winnerIndex = game.players.findIndex(p => p.id === trickResult?.winnerId)
  const relPos = myIndex >= 0 && winnerIndex >= 0 ? (winnerIndex - myIndex + 4) % 4 : 0
  const sweepVec = SWEEP_VECTORS[relPos]
  const winner = trickResult ? game.players.find(p => p.id === trickResult.winnerId) : null

  const dismiss = useCallback(() => setDismissing(true), [])

  // Auto-dismiss after 2s
  useEffect(() => {
    if (!trickResult || dismissing) return
    const t = setTimeout(dismiss, 2000)
    return () => clearTimeout(t)
  }, [trickResult, dismissing, dismiss])

  // Confirm after sweep animation completes
  useEffect(() => {
    if (!dismissing) return
    const t = setTimeout(() => { game.confirmOverlay(); setDismissing(false) }, 450)
    return () => clearTimeout(t)
  }, [dismissing, game.confirmOverlay])

  return (
    <AnimatePresence>
      {trickResult && (
        <motion.div
          key="trick-overlay"
          className={styles.trickOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: dismissing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ color: "gold", fontSize: "1.3rem", fontWeight: "bold", marginBottom: 12 }}>
            {winner
              ? `${winner.id === myId ? "You win" : `${winner.username} wins`} the trick!`
              : "Trick complete"}
          </div>

          <motion.div
            animate={dismissing ? { x: sweepVec.x, y: sweepVec.y, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}
          >
            {trickResult.playedCards.map(entry => {
              const player = game.players.find(p => p.id === entry.playerId)
              const isWinner = entry.playerId === trickResult.winnerId
              return (
                <div key={entry.playerId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <motion.div
                    animate={{ scale: isWinner ? 1.12 : 1 }}
                    style={{ filter: isWinner ? "drop-shadow(0 0 10px gold)" : "none", opacity: entry.card ? 1 : 0.35 }}
                  >
                    {entry.card
                      ? <Card suit={entry.card.suit} value={entry.card.value} />
                      : <div style={{ width: 60, height: 84, borderRadius: 8, border: "2px dashed rgba(255,255,255,0.3)" }} />
                    }
                  </motion.div>
                  <span style={{ color: isWinner ? "gold" : "rgba(255,255,255,0.7)", fontSize: 12 }}>
                    {player?.id === myId ? "You" : (player?.username ?? "?")}
                    {entry.card === null ? " (passed)" : ""}
                  </span>
                </div>
              )
            })}
          </motion.div>

          <button className={styles.button} style={{ fontSize: "1.1rem", padding: "10px 32px" }} onClick={dismiss}>
            OK
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
