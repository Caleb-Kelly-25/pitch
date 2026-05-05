import { useNavigate } from "react-router-dom"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import styles from "../styles/game.module.css"

export default function GameOverOverlay() {
  const game = useGame()
  const auth = useAuth()
  const navigate = useNavigate()

  const myIndex = game.players.findIndex(p => p.id === auth.user?.id)
  const winnerIndex = game.players.findIndex(p => p.id === game.bidWinnerId)
  const weWon = myIndex >= 0 && winnerIndex >= 0 && myIndex % 2 === winnerIndex % 2

  const winningTeam = game.players.filter((_, i) => i % 2 === winnerIndex % 2)
  const winnerNames = winningTeam.map(p => p.username).join(" & ")

  return (
    <div className={styles.trickOverlay} style={{ gap: "24px" }}>
      <div style={{ color: weWon ? "gold" : "#f5ede0", fontSize: "2rem", fontWeight: "bold", textAlign: "center" }}>
        {weWon ? "You Win!" : "Game Over"}
      </div>
      <div style={{ color: "#f5ede0", fontSize: "1.2rem", textAlign: "center" }}>
        {winnerNames} won the game
      </div>
      <div style={{ color: "#f5ede0", fontSize: "1rem", opacity: 0.8 }}>
        Final score — Us: {game.ourScore} · Them: {game.theirScore}
      </div>
      <button
        className={styles.button} style={{ fontSize: "1.2rem", padding: "12px 40px", marginTop: "8px" }}
        onClick={() => navigate("/")}
      >
        OK
      </button>
    </div>
  )
}
