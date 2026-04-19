import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { createGame } from "../features/game/gameService"
import TopBar from "../components/TopBar"

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    backgroundColor: "#f0ebe5",
    position: "fixed",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  main: {
    flex: 1,
    backgroundColor: "#7d2a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(24px, 4vh, 48px) clamp(32px, 5vw, 80px)",
    gap: "clamp(20px, 3vw, 40px)",
    backgroundImage:
      "radial-gradient(ellipse at 30% 50%, rgba(120,40,40,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(50,10,10,0.4) 0%, transparent 50%)",
    overflow: "hidden",
  },
}

function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Host() {
  const [gameCode, setGameCode] = useState("")
  const [gameId, setGameId] = useState("")
  const gameState = useGame()
  const auth = useAuth()
  const navigate = useNavigate()

  if (gameState.phase !== "WAITING" && gameState.players.length >= 4) {
    navigate("/gameplay")
    return null
  }

  return (
    <div style={styles.wrapper}>
      <TopBar variant="withBackBtn" />
      <div style={styles.main}>
        <h1>Host Game</h1>
        <button
          onClick={async () => {
            const code = generateGameCode()
            setGameCode(code)
            setGameId(await createGame(code, auth.token ?? ""))
          }}
        >
          Create Game
        </button>
        <h2>Game Code: {gameCode}</h2>
        <h2>Game Id: {gameId}</h2>
        <h3>Waiting for {Math.max(0, 4 - gameState.players.length)} more players</h3>
      </div>
    </div>
  )
}
