import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Copy, Check } from "lucide-react"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { createGame } from "../features/game/gameService"
import TopBar from "../components/TopBar"

function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const BG =
  "radial-gradient(ellipse at 30% 50%, rgba(120,40,40,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(50,10,10,0.4) 0%, transparent 50%)"

const ease = { duration: 0.38, ease: "easeOut" } as const
const spring = { type: "spring", stiffness: 340, damping: 26 } as const

export default function Host() {
  const [gameCode, setGameCode] = useState("")
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)
  const gameState = useGame()
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (created && gameState.phase !== "WAITING") {
      navigate("/gameplay")
    }
  }, [created, gameState.phase, navigate])

  async function handleCreate() {
    const code = generateGameCode()
    setGameCode(code)
    await createGame(code, auth.token ?? "")
    setCreated(true)
  }

  function handleCopy() {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const players = created && gameState.gameId !== "initialId" ? gameState.players : []
  const playerCount = players.length

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", margin: 0, padding: 0, fontFamily: "'Georgia', serif", backgroundColor: "#f0ebe5", position: "fixed", top: 0, left: 0, overflow: "hidden" }}>
      <TopBar variant="withBackBtn" />

      <div style={{ flex: 1, backgroundColor: "#7d2a2a", backgroundImage: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 4vh, 48px) clamp(32px, 5vw, 80px)", overflow: "hidden" }}>

        <AnimatePresence mode="wait">
          {!created ? (
            /* ── Create stage ─────────────────────────────────────────────── */
            <motion.div
              key="create"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={ease}
            >
              <h1 style={{ color: "#f5ede0", fontSize: "clamp(36px, 5vw, 64px)", fontFamily: "'Palatino Linotype', serif", margin: 0, letterSpacing: "-1px", textShadow: "2px 3px 6px rgba(0,0,0,0.5)" }}>
                Host a Game
              </h1>
              <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 17, margin: 0, textAlign: "center" }}>
                Create a room and share the code with three friends
              </p>
              <motion.button
                onClick={handleCreate}
                style={{ marginTop: 16, padding: "16px 48px", borderRadius: 12, border: "none", backgroundColor: "#8b1a1a", color: "#f5ede0", fontSize: 20, fontFamily: "'Palatino Linotype', serif", cursor: "pointer", letterSpacing: "0.5px", boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)" }}
                whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
                whileTap={{ scale: 0.96 }}
              >
                Create Game
              </motion.button>
            </motion.div>

          ) : (
            /* ── Lobby stage ──────────────────────────────────────────────── */
            <motion.div
              key="lobby"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%", maxWidth: 560 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={ease}
            >
              <h1 style={{ color: "#f5ede0", fontSize: "clamp(28px, 4vw, 48px)", fontFamily: "'Palatino Linotype', serif", margin: 0, letterSpacing: "-0.5px", textShadow: "2px 3px 6px rgba(0,0,0,0.5)" }}>
                Waiting for Players
              </h1>

              {/* Code card */}
              <motion.div
                style={{ backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 16, padding: "20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.1 }}
              >
                <span style={{ color: "rgba(245,237,224,0.6)", fontSize: 13, letterSpacing: 3, textTransform: "uppercase" }}>
                  Game Code
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "#f5ede0", fontSize: "clamp(40px, 7vw, 72px)", fontFamily: "monospace", letterSpacing: 8, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {gameCode}
                  </span>
                  <motion.button
                    onClick={handleCopy}
                    title="Copy code"
                    style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#7dcd7d" : "rgba(245,237,224,0.6)", padding: 4, display: "flex", alignItems: "center" }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={24} /></motion.span>
                        : <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={24} /></motion.span>
                      }
                    </AnimatePresence>
                  </motion.button>
                </div>
                <span style={{ color: "rgba(245,237,224,0.55)", fontSize: 14 }}>
                  Share this code with your friends
                </span>
              </motion.div>

              {/* Player slots */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                  <span style={{ color: "rgba(245,237,224,0.5)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Team 1</span>
                  <span style={{ color: "rgba(245,237,224,0.5)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Team 2</span>
                  {[1, 3].map(seat => <PlayerSlot key={seat} seat={seat} players={players} />)}
                  {[2, 4].map(seat => <PlayerSlot key={seat} seat={seat} players={players} />)}
                </div>
              </div>

              <p style={{ color: "rgba(245,237,224,0.7)", fontSize: 16, margin: 0, textAlign: "center" }}>
                {playerCount < 4
                  ? `${playerCount} of 4 players joined — waiting for ${4 - playerCount} more…`
                  : "All players joined! Starting soon…"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

function PlayerSlot({ seat, players }: { seat: number; players: { id: string; username: string; seat: number; isConnected: boolean }[] }) {
  const player = players.find(p => p.seat === seat)

  return (
    <AnimatePresence mode="wait">
      {player ? (
        <motion.div
          key={player.id}
          style={{ backgroundColor: "rgba(245,237,224,0.12)", border: "1px solid rgba(245,237,224,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#8b1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#f5ede0", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#f5ede0", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.username}</div>
            <div style={{ color: "rgba(245,237,224,0.5)", fontSize: 12 }}>Seat {seat}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: player.isConnected ? "#7dcd7d" : "#cd7d7d", flexShrink: 0 }} />
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          style={{ backgroundColor: "transparent", border: "1px dashed rgba(245,237,224,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px dashed rgba(245,237,224,0.2)", flexShrink: 0 }} />
          <div>
            <div style={{ color: "rgba(245,237,224,0.3)", fontSize: 15 }}>Open</div>
            <div style={{ color: "rgba(245,237,224,0.2)", fontSize: 12 }}>Seat {seat}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
