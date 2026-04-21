import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { joinGame } from "../features/game/gameService"
import TopBar from "../components/TopBar"

const BG =
  "radial-gradient(ellipse at 30% 50%, rgba(120,40,40,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(50,10,10,0.4) 0%, transparent 50%)"

export default function JoinGame() {
  const [inputCode, setInputCode] = useState("")
  const [joined, setJoined] = useState(false)
  const [joinedCode, setJoinedCode] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const gameState = useGame()
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (joined && gameState.phase !== "WAITING") {
      navigate("/gameplay")
    }
  }, [joined, gameState.phase, navigate])

  async function handleJoin() {
    const code = inputCode.trim().toUpperCase()
    if (!code) {
      setError("Please enter a game code.")
      return
    }
    setError("")
    await joinGame(code, auth.token ?? "")
    setJoinedCode(code)
    setJoined(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleJoin()
  }

  const players = joined && gameState.gameId !== "initialId" ? gameState.players : []
  const playerCount = players.length

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", margin: 0, padding: 0, fontFamily: "'Georgia', serif", backgroundColor: "#f0ebe5", position: "fixed", top: 0, left: 0, overflow: "hidden" }}>
      <TopBar variant="withBackBtn" />

      <div style={{ flex: 1, backgroundColor: "#7d2a2a", backgroundImage: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 4vh, 48px) clamp(32px, 5vw, 80px)", overflow: "hidden" }}>

        {!joined ? (
          /* ── Enter code stage ─────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%", maxWidth: 400 }}>
            <h1 style={{ color: "#f5ede0", fontSize: "clamp(36px, 5vw, 64px)", fontFamily: "'Palatino Linotype', serif", margin: 0, letterSpacing: "-1px", textShadow: "2px 3px 6px rgba(0,0,0,0.5)" }}>
              Join a Game
            </h1>
            <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 17, margin: 0, textAlign: "center" }}>
              Enter the code from your host
            </p>

            <input
              ref={inputRef}
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="XXXXXX"
              maxLength={8}
              style={{ width: "100%", padding: "18px 24px", borderRadius: 12, border: error ? "2px solid #e05555" : "2px solid transparent", backgroundColor: "rgba(200,175,165,0.25)", color: "#f5ede0", fontSize: 28, fontFamily: "monospace", letterSpacing: 8, textAlign: "center", outline: "none", boxSizing: "border-box", caretColor: "#f5ede0" }}
            />
            {error && <span style={{ color: "#e07777", fontSize: 14 }}>{error}</span>}

            <button
              onClick={handleJoin}
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", backgroundColor: "#8b1a1a", color: "#f5ede0", fontSize: 20, fontFamily: "'Palatino Linotype', serif", cursor: "pointer", letterSpacing: "0.5px", boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)" }}
            >
              Join
            </button>
          </div>

        ) : (
          /* ── Lobby stage ──────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%", maxWidth: 560 }}>

            {/* Title */}
            <h1 style={{ color: "#f5ede0", fontSize: "clamp(28px, 4vw, 48px)", fontFamily: "'Palatino Linotype', serif", margin: 0, letterSpacing: "-0.5px", textShadow: "2px 3px 6px rgba(0,0,0,0.5)" }}>
              Waiting for Host
            </h1>

            {/* Code badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ color: "rgba(245,237,224,0.5)", fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>Game Code</span>
              <span style={{ color: "#f5ede0", fontSize: "clamp(32px, 5vw, 56px)", fontFamily: "monospace", letterSpacing: 8, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                {joinedCode}
              </span>
            </div>

            {/* Player slots */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                <span style={{ color: "rgba(245,237,224,0.5)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Team 1</span>
                <span style={{ color: "rgba(245,237,224,0.5)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Team 2</span>

                {[1, 3].map(seat => <PlayerSlot key={seat} seat={seat} players={players} />)}
                {[2, 4].map(seat => <PlayerSlot key={seat} seat={seat} players={players} />)}
              </div>
            </div>

            {/* Status */}
            <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 16, margin: 0, textAlign: "center" }}>
              {playerCount < 4
                ? `${playerCount} of 4 players joined — waiting for ${4 - playerCount} more…`
                : "All players joined! Starting soon…"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerSlot({ seat, players }: { seat: number; players: { id: string; username: string; seat: number; isConnected: boolean }[] }) {
  const player = players.find(p => p.seat === seat)

  if (player) {
    return (
      <div style={{ backgroundColor: "rgba(245,237,224,0.12)", border: "1px solid rgba(245,237,224,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#8b1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#f5ede0", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {player.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#f5ede0", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.username}</div>
          <div style={{ color: "rgba(245,237,224,0.5)", fontSize: 12 }}>Seat {seat}</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: player.isConnected ? "#7dcd7d" : "#cd7d7d", flexShrink: 0 }} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "transparent", border: "1px dashed rgba(245,237,224,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px dashed rgba(245,237,224,0.2)", flexShrink: 0 }} />
      <div>
        <div style={{ color: "rgba(245,237,224,0.3)", fontSize: 15 }}>Open</div>
        <div style={{ color: "rgba(245,237,224,0.2)", fontSize: 12 }}>Seat {seat}</div>
      </div>
    </div>
  )
}
