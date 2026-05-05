export const HAND_CARD_PTS: Record<number, number> = { 1: 1, 2: 1, 3: 3, 10: 1, 11: 1, 12: 1 }

export function sumPoints(cards: { value: number }[]): number {
  return cards.reduce((s, c) => s + (HAND_CARD_PTS[c.value] ?? 0), 0)
}

export function cardLabel(value: number): string {
  if (value === 1)  return "A"
  if (value === 10) return "10"
  if (value === 11) return "★"
  if (value === 12) return "J"
  return String(value)
}
