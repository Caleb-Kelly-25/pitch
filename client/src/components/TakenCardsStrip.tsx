import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { SUIT_SYMBOLS, SUIT_COLORS } from "../features/game/constants"
import { cardLabel } from "../features/game/scoreUtils"

export function CardChip({ suit, value }: { suit: string; value: number }) {
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

const EMPTY = <span style={{ opacity: 0.3 }}>—</span>

export default function TakenCardsStrip() {
  const game = useGame()
  const auth = useAuth()

  if (game.phase !== "PLAYING") return null

  const myIndex = game.players.findIndex(p => p.id === auth.user?.id)
  const ourCards   = myIndex % 2 === 0 ? game.teamOneCardsWon : game.teamTwoCardsWon
  const theirCards = myIndex % 2 === 0 ? game.teamTwoCardsWon : game.teamOneCardsWon

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.45)", color: "#f5ede0",
      fontSize: "0.9rem", padding: "6px 20px", flexShrink: 0, gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
        <span style={{ opacity: 0.8, marginRight: 2 }}>Us</span>
        {ourCards.length === 0 ? EMPTY : ourCards.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)}
      </div>
      <div style={{ width: 1, height: 16, backgroundColor: "rgba(245,237,224,0.2)", flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {theirCards.length === 0 ? EMPTY : theirCards.map((c, i) => <CardChip key={i} suit={c.suit} value={c.value} />)}
        <span style={{ opacity: 0.8, marginLeft: 2 }}>Them</span>
      </div>
    </div>
  )
}
