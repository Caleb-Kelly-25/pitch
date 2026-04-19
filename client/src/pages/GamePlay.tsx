import { useNavigate } from "react-router-dom"
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
    backgroundColor: "#7d2a2a",
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
  scoreStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.45)",
    color: "#f5ede0",
    fontSize: "0.85rem",
    padding: "4px 16px",
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
        <span style={{ fontWeight: "bold" }}>Us · {ourScore}</span>
        <span>{teamA.map(p => p.username).join(" & ")}</span>
      </div>

      <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", opacity: 0.85 }}>
        {(game.phase === "PLAYING" || game.phase === "BLIND_CARDS") && (
          <span>Trick {game.trickNumber + 1}</span>
        )}
        <span>Trump: {suitLabel}</span>
      </div>

      <div style={styles.scoreTeam}>
        <span style={{ fontWeight: "bold" }}>Them · {theirScore}</span>
        <span>{teamB.map(p => p.username).join(" & ")}</span>
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
  const trumpSuit = game.leadSuit // leadSuit holds trump during PLAYING

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

  return (
    <Table
      bottom={game.trick.playedCards.find(p => p.playerId === game.players[(0 + ourIndex) % 4]?.id)?.card}
      left={game.trick.playedCards.find(p => p.playerId === game.players[(1 + ourIndex) % 4]?.id)?.card}
      top={game.trick.playedCards.find(p => p.playerId === game.players[(2 + ourIndex) % 4]?.id)?.card}
      right={game.trick.playedCards.find(p => p.playerId === game.players[(3 + ourIndex) % 4]?.id)?.card}
    >
      <PlayerSeat position="top">
        <HandOfCards count={game.players[2]?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="left">
        <HandOfCards count={game.players[1]?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="right">
        <HandOfCards count={game.players[3]?.cardCount ?? 0} />
      </PlayerSeat>
      <PlayerSeat position="bottom">
        <HandOfCards
          count={game.hand.length}
          cards={handCards}
        />
      </PlayerSeat>
    </Table>
  )
}

// ── Trick result overlay ─────────────────────────────────────────────────────
function TrickResultOverlay() {
  const game = useGame()
  const { trickResult } = game
  if (!trickResult) return null

  const winner = game.players.find(p => p.id === trickResult.winnerId)
  const winningEntry = trickResult.trick.playedCards.find(e => e.playerId === trickResult.winnerId)

  return (
    <div style={styles.trickOverlay}>
      <div style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold" }}>
        {winner ? `${winner.username} wins the trick!` : "Trick complete"}
      </div>
      {winningEntry?.card && (
        <div style={{ transform: "scale(1.15)", filter: "drop-shadow(0 0 12px gold)" }}>
          <Card suit={winningEntry.card.suit} value={winningEntry.card.value} />
        </div>
      )}
      <button style={{ ...styles.button, fontSize: "1.2rem", padding: "12px 32px" }} onClick={game.confirmTrickResult}>
        OK
      </button>
    </div>
  )
}

// ── Phase components ─────────────────────────────────────────────────────────
function WaitingPhase() {
  return <div style={styles.overlay}>Waiting for players to join...</div>
}

function BiddingPhase() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id
  const isTurn = game.bidding.currentBidderId === myId
  const isHighestBidder = game.bidding.highestBidderId === myId
  const isDealersTurn = game.bidding.bids.filter(bid => bid === null).length === 1
  const first3PlayersPassed = game.bidding.bids.slice(0, 3).every(bid => bid === 0)

  if (!isTurn) {
    const msg = isHighestBidder
      ? "You are the highest bidder. Please wait for other players to bid or pass..."
      : "Waiting for other players to bid..."
    return <div style={styles.overlay}>{msg}</div>
  }

  const bidOptions = [4, 5, 6, 7, 8, 9, 10] as const

  if (!isDealersTurn) {
    return (
      <div style={styles.bidButtons}>
        <div>It's your turn to bid. Please select a bid or pass.</div>
        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={() => placeBid(0, game.gameId)}>Pass</button>
          {bidOptions.map(n => (
            <button key={n} style={styles.button} onClick={() => placeBid(n, game.gameId)}>{n}</button>
          ))}
          <button style={styles.button} onClick={() => placeBid(11, game.gameId)}>Shoot the Moon</button>
        </div>
      </div>
    )
  }

  if (first3PlayersPassed) {
    return (
      <div style={styles.bidButtons}>
        <div>You are the dealer and all other players passed. You must bid at least 5.</div>
        <div style={styles.buttonRow}>
          {bidOptions.map(n => (
            <button key={n} style={styles.button} onClick={() => placeBid(n, game.gameId)}>{n}</button>
          ))}
          <button style={styles.button} onClick={() => placeBid(11, game.gameId)}>Shoot the Moon</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.bidButtons}>
      <div>It's your turn to bid. Please select a bid or pass.</div>
      <div style={styles.buttonRow}>
        <button style={styles.button} onClick={() => placeBid(0, game.gameId)}>Pass</button>
        {bidOptions.map(n => (
          <button key={n} style={styles.button} onClick={() => placeBid(n, game.gameId)}>{n}</button>
        ))}
        <button style={styles.button} onClick={() => placeBid(11, game.gameId)}>Shoot the Moon</button>
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
  const isBidWinner = game.bidWinnerId === auth.user?.id

  if (!isBidWinner) {
    return <div style={styles.overlay}>Waiting for the bid winner to arrange their hand...</div>
  }

  if (!game.currentBlindCard) {
    return <div style={styles.overlay}>Processing blind cards...</div>
  }

  const blindCard = game.currentBlindCard
  const handFull = game.hand.length >= 6

  // Hand cards: clicking swaps that card out for the blind card
  const handCards: CardProps[] = game.hand.map(card => ({
    suit: card.suit,
    value: card.value,
    onClick: () => game.blindCard('swap', card.suit, card.value),
  } as CardProps))

  return (
    <div style={styles.bidButtons}>
      <div style={{ fontSize: "1rem", marginBottom: "4px" }}>
        Blind card ({game.hand.length}/6 in hand)
      </div>
      {/* Visual blind card */}
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
      </div>
      {handFull && (
        <div style={{ fontSize: "0.9rem", color: "#f5c0a0", marginTop: "4px" }}>
          Hand full — click a card below to swap it out
        </div>
      )}
      {/* Current hand — click any card to discard it from hand without taking the blind card,
          or to swap when hand is full */}
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
    <div style={styles.wrapper}>
      <TopBar variant="gameplay" />
      <ScoreStrip />
      <PhaseDisplay />
      <TrickResultOverlay />
    </div>
  )
}
