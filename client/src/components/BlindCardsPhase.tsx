import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import Card from "./Card"
import HandOfCards from "./HandOfCards"
import type { CardProps } from "./Card"
import styles from "../styles/game.module.css"

export default function BlindCardsPhase() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id
  const isRecipient = game.blindCardRecipientId === myId

  if (!isRecipient) {
    const waitingFor = game.blindCardRecipientId === game.bidWinnerId ? "the bid winner" : "your partner"
    return <div className={styles.overlay}>Waiting for {waitingFor} to arrange their hand...</div>
  }

  if (!game.currentBlindCard) {
    return <div className={styles.overlay}>Processing blind cards...</div>
  }

  const blindCard = game.currentBlindCard
  const handFull = game.hand.length >= 6
  const isPartner = game.blindCardRecipientId !== game.bidWinnerId

  const handCards: CardProps[] = game.hand.map(card => ({
    suit: card.suit,
    value: card.value,
    onClick: () => game.blindCard('swap', card.suit, card.value),
  } as CardProps))

  return (
    <div className={styles.bidButtons}>
      <div style={{ fontSize: "1rem", marginBottom: "4px" }}>
        {isPartner ? "Blind cards — your partner's leftovers" : "Blind cards"} ({game.hand.length}/6 in hand)
      </div>
      <div style={{ transform: "scale(1.1)", marginBottom: "8px" }}>
        <Card suit={blindCard.suit} value={blindCard.value} />
      </div>
      <div className={styles.buttonRow}>
        {!handFull && (
          <button className={styles.button} onClick={() => game.blindCard('keep')}>
            Add to hand
          </button>
        )}
        <button className={styles.button} onClick={() => game.blindCard('discard')}>
          Skip
        </button>
        <button className={styles.button} style={{ backgroundColor: "#2a6e2a" }} onClick={() => game.blindCard('done')}>
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
