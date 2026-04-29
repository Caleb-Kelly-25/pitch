import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutGroup, AnimatePresence, motion } from "motion/react"
import TopBar from "../components/TopBar"
import Table from "../components/Table"
import HandOfCards from "../components/HandOfCards"
import PlayerSeat from "../components/PlayerSeat"
import Card from "../components/Card"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { placeBid, playCard } from "../features/game/gameService"
import type { CardProps } from "../components/Card"
import type { CardModel } from "../features/game/gameTypes"
import {EmberParticles, FloatingSuits } from "../components/Particles"
import { useSounds } from "../hooks/useSounds"
import AmbientMusic from "../components/AmbientMusic"

// ── Sound engine ─────────────────────────────────────────────────────────────
function SoundEngine() {
  const game = useGame()
  const { playCard, playTrickWin, playShuffle } = useSounds()

  const prevPlayedCount = useRef(0)
  const prevPhase = useRef(game.phase)
  const prevTrickResult = useRef(game.trickResult)

  // Card played: played-card count increases (ignore resets to 0)
  useEffect(() => {
    const n = game.trick.playedCards.length
    if (n > 0 && n > prevPlayedCount.current) playCard()
    prevPlayedCount.current = n
  }, [game.trick.playedCards.length, playCard])

  // Trick won: trickResult just became non-null
  useEffect(() => {
    if (game.trickResult && !prevTrickResult.current) playTrickWin()
    prevTrickResult.current = game.trickResult
  }, [game.trickResult, playTrickWin])

  // New hand dealt: phase transitions into BIDDING
  useEffect(() => {
    if (game.phase === "BIDDING" && prevPhase.current !== "BIDDING") playShuffle()
    prevPhase.current = game.phase
  }, [game.phase, playShuffle])

  return null
}

// ── Count-up animation hook ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    setValue(0)
    if (target === 0) return
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

// ── Jick lookup ────────────────────────────────────────────────────────��─────
const JICK_MAP: Record<string, { suit: string; value: number }> = {
  HEARTS:   { suit: "DIAMONDS", value: 12 },
  DIAMONDS: { suit: "HEARTS",   value: 12 },
  CLUBS:    { suit: "SPADES",   value: 12 },
  SPADES:   { suit: "CLUBS",    value: 12 },
}

function isTrumpCard(card: CardModel, trumpSuit: string): boolean {
  if (card.suit === trumpSuit) return true
  if (card.value === 11) return true // Joker
  const jick = JICK_MAP[trumpSuit]
  return jick ? card.suit === jick.suit && card.value === jick.value : false
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    background:
  "linear-gradient(135deg, #5a1515 0%, #7d2a2a 35%, #3b0d0d 100%)",
      backgroundSize: "300% 300%",
      animation: "gradientShift 16s ease infinite",
    position: "fixed",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  overlay: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "2rem",
    color: "white",
    textAlign: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  bidButtons: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "2rem",
    color: "white",
    textAlign: "center",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    fontSize: "1rem",
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#8b1a1a",
    color: "#f5ede0",
    border: "none",
    transition: "background-color 0.2s",
  },
  buttonDisabled: {
    backgroundColor: "rgba(80,60,60,0.35)",
    color: "rgba(245,237,224,0.3)",
    cursor: "not-allowed",
  },
  scoreStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#f5ede0",
    fontSize: "1rem",
    padding: "8px 20px",
    flexShrink: 0,
    gap: "16px",
    flexWrap: "wrap",
  },
  scoreTeam: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  trickOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    gap: "20px",
  },
}

const SUIT_SYMBOLS: Record<string, string> = {
  HEARTS: "♥", DIAMONDS: "♦", CLUBS: "♣", SPADES: "♠",
}

// ── Scoreboard strip ─────────────────────────────────────────────────────────
function ScoreStrip() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id
  const myIndex = game.players.findIndex(p => p.id === myId)

  const teamA = game.players.filter((_, i) => i % 2 === myIndex % 2)
  const teamB = game.players.filter((_, i) => i % 2 !== myIndex % 2)
  const ourScore  = myIndex % 2 === 0 ? game.ourScore  : game.theirScore
  const theirScore = myIndex % 2 === 0 ? game.theirScore : game.ourScore

  const trumpDisplay = game.leadSuit ?? game.trumpSuit
  const suitLabel = trumpDisplay
    ? `${SUIT_SYMBOLS[trumpDisplay]} ${trumpDisplay.charAt(0) + trumpDisplay.slice(1).toLowerCase()}`
    : "—"

  return (
    <div style={styles.scoreStrip}>
      <div style={styles.scoreTeam}>
        <span style={{ fontWeight: "bold" }}>
          Us ·{" "}
          <motion.span
            key={ourScore}
            initial={{ scale: 1.5, color: "#f5c06a" }}
            animate={{ scale: 1, color: "#f5ede0" }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            style={{ display: "inline-block" }}
          >
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
        {(game.phase === "PLAYING") && (
        <span>Bid Winner: {game.players.find(p => p.id === game.bidWinnerId)?.username}</span>)}
      </div>

      <div style={styles.scoreTeam}>
        <span style={{ fontWeight: "bold" }}>
          Them ·{" "}
          <motion.span
            key={theirScore}
            initial={{ scale: 1.5, color: "#f5c06a" }}
            animate={{ scale: 1, color: "#f5ede0" }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            style={{ display: "inline-block" }}
          >
            {theirScore}
          </motion.span>
        </span>
        <span>{teamB.map(p => p.username).join(" & ")}</span>
      </div>
    </div>
  )
}

// ── Taken point-cards strip ──────────────────────────────────────────────────
const SUIT_COLORS: Record<string, string> = {
  HEARTS: "#e05555", DIAMONDS: "#e05555", CLUBS: "#f5ede0", SPADES: "#f5ede0",
}

function cardLabel(value: number): string {
  if (value === 1)  return "A"
  if (value === 10) return "10"
  if (value === 11) return "★"
  if (value === 12) return "J"
  return String(value)
}

function CardChip({ suit, value }: { suit: string; value: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 1,
      backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5,
      padding: "2px 6px", fontSize: 14, fontWeight: 700,
      color: SUIT_COLORS[suit] ?? "#f5ede0",
    }}>
      {SUIT_SYMBOLS[suit]}{cardLabel(value)}
    </span>
  )
}

function TakenCardsStrip() {
  const game = useGame()
  const auth = useAuth()
  if (game.phase !== "PLAYING") return null

  const myIndex = game.players.findIndex(p => p.id === auth.user?.id)
  const ourCards  = myIndex % 2 === 0 ? game.teamOneCardsWon : game.teamTwoCardsWon
  const theirCards = myIndex % 2 === 0 ? game.teamTwoCardsWon : game.teamOneCardsWon

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.45)", color: "#f5ede0",
      fontSize: "0.9rem", padding: "6px 20px", flexShrink: 0, gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
        <span style={{ opacity: 0.8, marginRight: 2 }}>Us</span>
        {ourCards.length === 0
          ? <span style={{ opacity: 0.3 }}>—</span>
          : ourCards.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)
        }
      </div>
      <div style={{ width: 1, height: 16, backgroundColor: "rgba(245,237,224,0.2)", flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {theirCards.length === 0
          ? <span style={{ opacity: 0.3 }}>—</span>
          : theirCards.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)
        }
        <span style={{ opacity: 0.8, marginLeft: 2 }}>Them</span>
      </div>
    </div>
  )
}

// ── Table with card-play filtering ───────────────────────────────────────────
function GameTable() {
  const game = useGame()
  const auth = useAuth()
  const ourIndex = game.players.findIndex(p => p.id === auth.user?.id)
  const myId = auth.user?.id
  const isMyTurn = game.trick.playerTurn === myId
  const trumpSuit = game.leadSuit
  const activeTrump = (game.phase === "PLAYING" || game.phase === "BLIND_CARDS")
    ? (game.leadSuit ?? game.trumpSuit)
    : null

  const playerAt = (offset: number) => game.players[(ourIndex + offset) % 4]

  const handCards: CardProps[] = game.hand.map(card => {
    const playable = game.phase === "PLAYING" && isMyTurn &&
      trumpSuit != null && isTrumpCard(card, trumpSuit)
    const notPlayable = game.phase === "PLAYING" && isMyTurn && !playable
    return {
      suit: card.suit,
      value: card.value,
      highlighted: playable,
      dimmed: notPlayable,
      onClick: playable ? () => playCard(card.suit, card.value, game.gameId) : undefined,
    } as CardProps
  })

  const turn = game.phase === "PLAYING" ? game.trick.playerTurn : null
  const isActive = (idx: number) => turn === game.players[(ourIndex + idx) % 4]?.id

  const nameLabel: React.CSSProperties = {
    position: "absolute",
    zIndex: 15,
    backgroundColor: "rgba(0,0,0,0.45)",
    color: "rgba(245,237,224,0.75)",
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: "'Georgia', serif",
    letterSpacing: 0.3,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  }

  return (
    <Table
      bottom={game.trick.playedCards.find(p => p.playerId === game.players[(0 + ourIndex) % 4]?.id)?.card}
      left={game.trick.playedCards.find(p => p.playerId === game.players[(1 + ourIndex) % 4]?.id)?.card}
      top={game.trick.playedCards.find(p => p.playerId === game.players[(2 + ourIndex) % 4]?.id)?.card}
      right={game.trick.playedCards.find(p => p.playerId === game.players[(3 + ourIndex) % 4]?.id)?.card}
    >
      {/* Player name labels — non-rotated, positioned at each seat edge */}
      <div style={{ ...nameLabel, bottom: "3%", left: "50%", transform: "translateX(-50%)", color: "#f5c06a" }}>You</div>
      {playerAt(2)?.username && <div style={{ ...nameLabel, top: "3%", left: "50%", transform: "translateX(-50%)" }}>{playerAt(2)!.username}</div>}
      {playerAt(1)?.username && <div style={{ ...nameLabel, left: "2%", top: "50%", transform: "translateY(-50%)" }}>{playerAt(1)!.username}</div>}
      {playerAt(3)?.username && <div style={{ ...nameLabel, right: "2%", top: "50%", transform: "translateY(-50%)" }}>{playerAt(3)!.username}</div>}

      {/* Trump suit badge — appears in the center gap of the 4-card grid */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20, pointerEvents: "none" }}>
        <AnimatePresence>
          {activeTrump && (
            <motion.span
              key={activeTrump}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.82 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              style={{
                display: "block",
                fontSize: 48,
                lineHeight: 1,
                color: "#c49a2e",
                textShadow:
                  "0 -1px 1px rgba(0,0,0,0.45), 0 1px 0 rgba(220,185,80,0.3), 0 0 12px rgba(160,120,20,0.25)",
              }}
            >
              {SUIT_SYMBOLS[activeTrump]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <PlayerSeat position="top" isActive={isActive(2)}>
        <HandOfCards count={playerAt(2)?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="left" isActive={isActive(1)}>
        <HandOfCards count={playerAt(1)?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="right" isActive={isActive(3)}>
        <HandOfCards count={playerAt(3)?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="bottom" isActive={isActive(0)}>
        <HandOfCards
          count={game.hand.length}
          cards={handCards}
          active={isActive(0)}
        />
      </PlayerSeat>
    </Table>
  )
}

// Sweep direction toward the winner's seat (relative to viewer's bottom position)
const SWEEP_VECTORS = [
  { x: 0,    y: 500  },  // 0 = us (bottom)
  { x: -600, y: 0    },  // 1 = left
  { x: 0,    y: -500 },  // 2 = top
  { x: 600,  y: 0    },  // 3 = right
]

// ── Trick result overlay ─────────────────────────────────────────────────────
function TrickResultOverlay() {
  const game = useGame()
  const auth = useAuth()
  const { trickResult } = game
  const [dismissing, setDismissing] = useState(false)

  const myId = auth.user?.id
  const myIndex = game.players.findIndex(p => p.id === myId)
  const winnerIndex = game.players.findIndex(p => p.id === trickResult?.winnerId)
  const relPos = myIndex >= 0 && winnerIndex >= 0 ? (winnerIndex - myIndex + 4) % 4 : 0
  const sweepVec = SWEEP_VECTORS[relPos]

  // Auto-dismiss after 2s
  useEffect(() => {
    if (!trickResult || dismissing) return
    const t = setTimeout(() => setDismissing(true), 2000)
    return () => clearTimeout(t)
  }, [trickResult, dismissing])

  // After sweep animation completes, confirm
  useEffect(() => {
    if (!dismissing) return
    const t = setTimeout(() => { game.confirmOverlay(); setDismissing(false) }, 450)
    return () => clearTimeout(t)
  }, [dismissing])

  const winner = game.players.find(p => p.id === trickResult?.winnerId)

  return (
    <AnimatePresence>
      {trickResult && (
        <motion.div
          key="trick-overlay"
          style={styles.trickOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: dismissing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ color: "gold", fontSize: "1.3rem", fontWeight: "bold", marginBottom: 12 }}>
            {winner ? `${winner.id === myId ? "You win" : `${winner.username} wins`} the trick!` : "Trick complete"}
          </div>

          <motion.div
            animate={dismissing
              ? { x: sweepVec.x, y: sweepVec.y, opacity: 0 }
              : { x: 0, y: 0, opacity: 1 }
            }
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

          <button style={{ ...styles.button, fontSize: "1.1rem", padding: "10px 32px" }} onClick={() => setDismissing(true)}>
            OK
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Hand result overlay ───────────────────────────────────────────────────────
const HAND_CARD_PTS: Record<number, number> = { 1: 1, 2: 1, 3: 3, 10: 1, 11: 1, 12: 1 }
function sumPoints(cards: { value: number }[]) {
  return cards.reduce((s, c) => s + (HAND_CARD_PTS[c.value] ?? 0), 0)
}

function HandResultOverlay() {
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
    const teamPlayers = game.players.filter((_, i) => isUs ? i % 2 === myIndex % 2 : i % 2 !== myIndex % 2)
    return `${isUs ? "Us" : "Them"} (${teamPlayers.map(p => p.username).join(" & ")}): ${pts} pt${pts !== 1 ? "s" : ""}`
  }

  return (
    <div style={{ ...styles.trickOverlay, gap: 20, padding: "24px 32px" }}>
      <div style={{ color: "#f5ede0", fontSize: "1.5rem", fontWeight: "bold" }}>Hand Over</div>

      {/* Bid outcome */}
      <div style={{ fontSize: "0.95rem", color: bidMade ? "#7dcd7d" : "#e07777", fontStyle: "italic" }}>
        Bid {handResult.bidAmount} — {bidderOnOurTeam ? "Us" : "Them"} {bidMade ? "made it" : "were set"}
      </div>

      {/* Our team */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ color: "#f5ede0", fontSize: "0.9rem" }}>{teamLabel(ourPts, true)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {ourCardsWon.length === 0
            ? <span style={{ color: "rgba(245,237,224,0.4)", fontSize: 13 }}>No point cards</span>
            : ourCardsWon.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)
          }
        </div>
      </div>

      <div style={{ width: "80%", height: 1, backgroundColor: "rgba(245,237,224,0.15)" }} />

      {/* Their team */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ color: "#f5ede0", fontSize: "0.9rem" }}>{teamLabel(theirPts, false)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {theirCardsWon.length === 0
            ? <span style={{ color: "rgba(245,237,224,0.4)", fontSize: 13 }}>No point cards</span>
            : theirCardsWon.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)
          }
        </div>
      </div>

      <button style={{ ...styles.button, fontSize: "1.1rem", padding: "10px 32px", marginTop: 4 }} onClick={game.confirmOverlay}>
        OK
      </button>
    </div>
  )
}

// ── Phase components ─────────────────────────────────────────────────────────
function WaitingPhase() {
  return <div style={styles.overlay}>Waiting for players to join...</div>
}

function BidSummary() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
      {game.players.map((player, i) => {
        const bid = game.bidding.bids[i]
        const isCurrent = player.id === game.bidding.currentBidderId
        const isMe = player.id === myId
        let bidLabel: string
        if (bid === undefined) bidLabel = "—"
        else if (bid === 0) bidLabel = "Pass"
        else if (bid === 11) bidLabel = "Moon"
        else bidLabel = String(bid)

        return (
          <div
            key={player.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: 8,
              backgroundColor: isCurrent ? "rgba(245,237,224,0.18)" : "rgba(0,0,0,0.2)",
              border: isCurrent ? "1px solid rgba(245,237,224,0.4)" : "1px solid transparent",
              minWidth: 64,
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(245,237,224,0.55)", marginBottom: 2 }}>
              {isMe ? "You" : player.username}{isCurrent ? " ●" : ""}
            </span>
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: bid !== undefined && bid > 0 ? "#f5c06a" : "rgba(245,237,224,0.5)",
            }}>
              {bidLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function BiddingPhase() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id
  const isTurn = game.bidding.currentBidderId === myId
  const isHighestBidder = game.bidding.highestBidderId === myId
  const isDealersTurn = game.bidding.bids.filter(bid => bid === undefined).length === 1
  const first3PlayersPassed = game.bidding.bids.slice(0, 3).every(bid => bid === 0)

  const highestBid = Math.max(0, ...game.bidding.bids.filter((b): b is number => b !== undefined && b > 0))
  const bidOptions = [4, 5, 6, 7, 8, 9, 10] as const

  function bidBtn(n: number, label?: string) {
    const disabled = n <= highestBid
    return (
      <button
        key={n}
        disabled={disabled}
        style={disabled ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        onClick={disabled ? undefined : () => placeBid(n, game.gameId)}
      >
        {label ?? n}
      </button>
    )
  }

  if (!isTurn) {
    const msg = isHighestBidder
      ? "You have the high bid. Waiting for other players…"
      : "Waiting for other players to bid…"
    return (
      <div style={styles.bidButtons}>
        <BidSummary />
        <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>{msg}</div>
      </div>
    )
  }

  if (first3PlayersPassed && isDealersTurn) {
    return (
      <div style={styles.bidButtons}>
        <BidSummary />
        <div>All others passed — you must bid at least 5.</div>
        <div style={styles.buttonRow}>
          {bidOptions.map(n => bidBtn(n))}
          {bidBtn(11, "Shoot the Moon")}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.bidButtons}>
      <BidSummary />
      <div>Your turn to bid — select an amount or pass.</div>
      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={() => placeBid(0, game.gameId)}>Pass</button>
        {bidOptions.map(n => bidBtn(n))}
        {bidBtn(11, "Shoot the Moon")}
      </div>
    </div>
  )
}

function TrumpSelectionPhase() {
  const game = useGame()
  const auth = useAuth()
  const isBidWinner = game.bidWinnerId === auth.user?.id

  if (!isBidWinner) {
    return <div style={styles.overlay}>Waiting for the bid winner to select a trump suit...</div>
  }

  const suits = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"] as const

  return (
    <div style={styles.bidButtons}>
      <div>You won the bid! Select the trump suit.</div>
      <div style={styles.buttonRow}>
        {suits.map(suit => (
          <button key={suit} style={styles.button} onClick={() => game.pickSuit(suit)}>
            {SUIT_SYMBOLS[suit]} {suit.charAt(0) + suit.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function BlindCardsPhase() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id
  const isRecipient = game.blindCardRecipientId === myId
  const isPartner = isRecipient && game.blindCardRecipientId !== game.bidWinnerId

  if (!isRecipient) {
    const waitingFor = game.blindCardRecipientId === game.bidWinnerId
      ? "the bid winner"
      : "your partner"
    return <div style={styles.overlay}>Waiting for {waitingFor} to arrange their hand...</div>
  }

  if (!game.currentBlindCard) {
    return <div style={styles.overlay}>Processing blind cards...</div>
  }

  const blindCard = game.currentBlindCard
  const handFull = game.hand.length >= 6

  const handCards: CardProps[] = game.hand.map(card => ({
    suit: card.suit,
    value: card.value,
    onClick: () => game.blindCard('swap', card.suit, card.value),
  } as CardProps))

  return (
    <div style={styles.bidButtons}>
      <div style={{ fontSize: "1rem", marginBottom: "4px" }}>
        {isPartner ? "Blind cards — your partner's leftovers" : "Blind cards"} ({game.hand.length}/6 in hand)
      </div>
      <div style={{ transform: "scale(1.1)", marginBottom: "8px" }}>
        <Card suit={blindCard.suit} value={blindCard.value} />
      </div>
      <div style={styles.buttonRow}>
        {!handFull && (
          <button style={styles.button} onClick={() => game.blindCard('keep')}>
            Add to hand
          </button>
        )}
        <button style={styles.button} onClick={() => game.blindCard('discard')}>
          Skip
        </button>
        <button
          style={{ ...styles.button, backgroundColor: "#2a6e2a" }}
          onClick={() => game.blindCard('done')}
        >
          Done
        </button>
      </div>
      {handFull && (
        <div style={{ fontSize: "0.9rem", color: "#f5c0a0", marginTop: "4px" }}>
          Hand full — click a card below to swap it out, or press Done
        </div>
      )}
      <div style={{ marginTop: "12px" }}>
        <HandOfCards count={game.hand.length} cards={handCards} overlap={35} />
      </div>
    </div>
  )
}

// ── Game over overlay ────────────────────────────────────────────────────────
function GameOverOverlay() {
  const game = useGame()
  const auth = useAuth()
  const navigate = useNavigate()

  const myId = auth.user?.id
  const myIndex = game.players.findIndex(p => p.id === myId)
  const winnerIndex = game.players.findIndex(p => p.id === game.bidWinnerId)
  const weWon = myIndex >= 0 && winnerIndex >= 0 && myIndex % 2 === winnerIndex % 2

  const winningTeam = game.players.filter((_, i) => i % 2 === winnerIndex % 2)
  const winnerNames = winningTeam.map(p => p.username).join(" & ")

  return (
    <div style={{ ...styles.trickOverlay, gap: "24px" }}>
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
        style={{ ...styles.button, fontSize: "1.2rem", padding: "12px 40px", marginTop: "8px" }}
        onClick={() => navigate("/")}
      >
        OK
      </button>
    </div>
  )
}

// ── Phase router ─────────────────────────────────────────────────────────────
function PhaseDisplay() {
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

// ── Root component ────────────────────────────────────────────────────────────
export default function GamePlay() {

  return (
    <>
    <style>{`
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes floatSuit {
      0% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.12;
      }
      90% {
        opacity: 0.12;
      }
      100% {
        transform: translateY(-120vh) rotate(360deg);
        opacity: 0;
      }
    }

    @keyframes emberFloat {
      0% {
        transform: translateY(0px);
        opacity: 0;
      }
      15% {
        opacity: 0.4;
      }
      100% {
        transform: translateY(-120vh);
        opacity: 0;
      }
    }

    
  `}</style>
    <LayoutGroup id="game-cards">
      <div style={styles.wrapper}>
        <SoundEngine />
        <AmbientMusic />
        <FloatingSuits />
        <EmberParticles />
        <TopBar variant="gameplay" />
        <ScoreStrip />
        <TakenCardsStrip />
        
        <PhaseDisplay />

        <TrickResultOverlay />
        <HandResultOverlay />
      </div>
    </LayoutGroup>
    </>
  )
}
