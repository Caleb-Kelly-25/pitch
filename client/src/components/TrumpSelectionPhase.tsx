import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { SUIT_SYMBOLS } from "../features/game/constants"
import styles from "../styles/game.module.css"

const SUITS = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"] as const

export default function TrumpSelectionPhase() {
  const game = useGame()
  const auth = useAuth()

  if (game.bidWinnerId !== auth.user?.id) {
    return <div className={styles.overlay}>Waiting for the bid winner to select a trump suit...</div>
  }

  return (
    <div className={styles.bidButtons}>
      <div>You won the bid! Select the trump suit.</div>
      <div className={styles.buttonRow}>
        {SUITS.map(suit => (
          <button key={suit} className={styles.button} onClick={() => game.pickSuit(suit)}>
            {SUIT_SYMBOLS[suit]} {suit.charAt(0) + suit.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
