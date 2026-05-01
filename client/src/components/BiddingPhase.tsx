import { useGame } from "../features/game/useGame"
import { useAuth } from "../features/auth/useAuth"
import { placeBid } from "../features/game/gameService"
import styles from "../styles/game.module.css"

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
        const bidLabel = bid === undefined ? "—" : bid === 0 ? "Pass" : bid === 11 ? "Moon" : String(bid)

        return (
          <div
            key={player.id}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "6px 14px", borderRadius: 8, minWidth: 64,
              backgroundColor: isCurrent ? "rgba(245,237,224,0.18)" : "rgba(0,0,0,0.2)",
              border: isCurrent ? "1px solid rgba(245,237,224,0.4)" : "1px solid transparent",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(245,237,224,0.55)", marginBottom: 2 }}>
              {isMe ? "You" : player.username}{isCurrent ? " ●" : ""}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: bid !== undefined && bid > 0 ? "#f5c06a" : "rgba(245,237,224,0.5)" }}>
              {bidLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BiddingPhase() {
  const game = useGame()
  const auth = useAuth()
  const myId = auth.user?.id

  const isTurn = game.bidding.currentBidderId === myId
  const isHighestBidder = game.bidding.highestBidderId === myId
  const isDealersTurn = game.bidding.bids.filter(b => b === undefined).length === 1
  const first3Passed = game.bidding.bids.slice(0, 3).every(b => b === 0)
  const highestBid = Math.max(0, ...game.bidding.bids.filter((b): b is number => b !== undefined && b > 0))
  const bidOptions = [4, 5, 6, 7, 8, 9, 10] as const

  function BidBtn({ n, label }: { n: number; label?: string }) {
    const disabled = n <= highestBid
    return (
      <button
        key={n}
        disabled={disabled}
        className={`${styles.button}${disabled ? ` ${styles.buttonDisabled}` : ""}`}
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
      <div className={styles.bidButtons}>
        <BidSummary />
        <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>{msg}</div>
      </div>
    )
  }

  if (first3Passed && isDealersTurn) {
    return (
      <div className={styles.bidButtons}>
        <BidSummary />
        <div>All others passed — you must bid at least 5.</div>
        <div className={styles.buttonRow}>
          {bidOptions.map(n => <BidBtn key={n} n={n} />)}
          <BidBtn n={11} label="Shoot the Moon" />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.bidButtons}>
      <BidSummary />
      <div>Your turn to bid — select an amount or pass.</div>
      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={() => placeBid(0, game.gameId)}>Pass</button>
        {bidOptions.map(n => <BidBtn key={n} n={n} />)}
        <BidBtn n={11} label="Shoot the Moon" />
      </div>
    </div>
  )
}
