import type { CardModel } from "./gameTypes"

const JICK_MAP: Record<string, { suit: string; value: number }> = {
  HEARTS:   { suit: "DIAMONDS", value: 12 },
  DIAMONDS: { suit: "HEARTS",   value: 12 },
  CLUBS:    { suit: "SPADES",   value: 12 },
  SPADES:   { suit: "CLUBS",    value: 12 },
}

export function isTrumpCard(card: CardModel, trumpSuit: string): boolean {
  if (card.suit === trumpSuit) return true
  if (card.value === 11) return true // joker is always trump
  const jick = JICK_MAP[trumpSuit]
  return jick ? card.suit === jick.suit && card.value === jick.value : false
}
