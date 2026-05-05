import { AnimatePresence, motion } from "motion/react"
import Table from "./Table"
import HandOfCards from "./HandOfCards"
import PlayerSeat from "./PlayerSeat"
import type { CardProps } from "./Card"
import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { isTrumpCard } from "../features/game/cardUtils"
import { SUIT_SYMBOLS } from "../features/game/constants"
import { playCard } from "../features/game/gameService"

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

const trumpStyle: React.CSSProperties = {
  display: "block",
  fontSize: 48,
  lineHeight: 1,
  color: "#c49a2e",
  textShadow: "0 -1px 1px rgba(0,0,0,0.45), 0 1px 0 rgba(220,185,80,0.3), 0 0 12px rgba(160,120,20,0.25)",
}

export default function GameTable() {
  const game = useGame()
  const auth = useAuth()

  const myId = auth.user?.id
  const ourIndex = game.players.findIndex(p => p.id === myId)
  const isMyTurn = game.trick.playerTurn === myId
  const trumpSuit = game.leadSuit
  const activeTrump = (game.phase === "PLAYING" || game.phase === "BLIND_CARDS")
    ? (game.leadSuit ?? game.trumpSuit)
    : null

  const playerAt = (offset: number) => game.players[(ourIndex + offset) % 4]

  // Build a lookup map once instead of four separate .find() calls
  const cardByPlayer = Object.fromEntries(
    game.trick.playedCards.map(e => [e.playerId, e.card])
  )

  const handCards: CardProps[] = game.hand.map(card => {
    const playable = game.phase === "PLAYING" && isMyTurn && trumpSuit != null && isTrumpCard(card, trumpSuit)
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

  return (
    <Table
      bottom={cardByPlayer[game.players[(ourIndex + 0) % 4]?.id]}
      left={cardByPlayer[game.players[(ourIndex + 1) % 4]?.id]}
      top={cardByPlayer[game.players[(ourIndex + 2) % 4]?.id]}
      right={cardByPlayer[game.players[(ourIndex + 3) % 4]?.id]}
    >
      <div style={{ ...nameLabel, bottom: "3%", left: "50%", transform: "translateX(-50%)", color: "#f5c06a" }}>You</div>
      {playerAt(2)?.username && <div style={{ ...nameLabel, top: "3%", left: "50%", transform: "translateX(-50%)" }}>{playerAt(2)!.username}</div>}
      {playerAt(1)?.username && <div style={{ ...nameLabel, left: "2%", top: "50%", transform: "translateY(-50%)" }}>{playerAt(1)!.username}</div>}
      {playerAt(3)?.username && <div style={{ ...nameLabel, right: "2%", top: "50%", transform: "translateY(-50%)" }}>{playerAt(3)!.username}</div>}

      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20, pointerEvents: "none" }}>
        <AnimatePresence>
          {activeTrump && (
            <motion.span
              key={activeTrump}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.82 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              style={trumpStyle}
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
        <HandOfCards count={game.hand.length} cards={handCards} active={isActive(0)} />
      </PlayerSeat>
    </Table>
  )
}
