import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import TopBar from "../components/TopBar"
import { useAuth } from "../features/auth/useAuth"
import { fetchLeaderboard, type LeaderboardEntry, type LeaderboardPage } from "../features/profile/profileService"

const PAGE_SIZE = 20

function pct(num: number, den: number) {
  if (den === 0) return "—"
  return `${Math.round((num / den) * 100)}%`
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#7d2a2a",
    fontFamily: "'Georgia', serif",
    color: "#f5ede0",
  },
  body: {
    flex: 1,
    maxWidth: 760,
    width: "100%",
    margin: "0 auto",
    padding: "28px 16px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "0.82rem",
    opacity: 0.45,
    textAlign: "center",
    marginBottom: 24,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.88rem",
  },
  th: {
    padding: "8px 10px",
    textAlign: "left",
    borderBottom: "1px solid rgba(245,237,224,0.2)",
    opacity: 0.55,
    fontWeight: 400,
    fontSize: "0.75rem",
    letterSpacing: 0.5,
  },
  thRight: {
    padding: "8px 10px",
    textAlign: "right",
    borderBottom: "1px solid rgba(245,237,224,0.2)",
    opacity: 0.55,
    fontWeight: 400,
    fontSize: "0.75rem",
    letterSpacing: 0.5,
  },
  td: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(245,237,224,0.07)",
  },
  tdRight: {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(245,237,224,0.07)",
    textAlign: "right",
    color: "#f5c06a",
    fontWeight: 700,
  },
  rank: {
    opacity: 0.4,
    fontSize: "0.8rem",
    minWidth: 28,
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
  },
  pageBtn: {
    padding: "6px 18px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#8b1a1a",
    color: "#f5ede0",
    fontSize: "0.9rem",
  },
  pageBtnDisabled: {
    padding: "6px 18px",
    borderRadius: 6,
    border: "none",
    cursor: "not-allowed",
    backgroundColor: "rgba(80,40,40,0.35)",
    color: "rgba(245,237,224,0.3)",
    fontSize: "0.9rem",
  },
  empty: {
    textAlign: "center",
    opacity: 0.45,
    padding: "48px 0",
  },
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <tr>
      <td style={{ ...styles.td, ...styles.rank }}>{rank}</td>
      <td style={styles.td}>{entry.username}</td>
      <td style={styles.tdRight}>{entry.gamesWon}<span style={{ opacity: 0.45, fontWeight: 400 }}>/{entry.gamesCompleted}</span></td>
      <td style={styles.tdRight}>{pct(entry.gamesWon, entry.gamesCompleted)}</td>
      <td style={styles.tdRight}>{pct(entry.tricksWon, entry.tricksPlayed)}</td>
      <td style={styles.tdRight}>{pct(entry.bidsWon, entry.bidsPlayed)}</td>
    </tr>
  )
}

export default function Leaderboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<LeaderboardPage | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    fetchLeaderboard(token, page, PAGE_SIZE)
      .then(setData)
      .catch(() => setError("Could not load leaderboard."))
      .finally(() => setLoading(false))
  }, [token, page])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const offset = (page - 1) * PAGE_SIZE

  return (
    <div style={styles.page}>
      <TopBar variant="withBackBtn" />
      <div style={styles.body}>
        <div style={styles.title}>Leaderboard</div>
        <div style={styles.subtitle}>Ranked by games won · all-time</div>

        {error && <div style={{ ...styles.empty, color: "#e07777" }}>{error}</div>}

        {!error && loading && <div style={styles.empty}>Loading…</div>}

        {!error && !loading && data && data.entries.length === 0 && (
          <div style={styles.empty}>No games played yet. Be the first!</div>
        )}

        {!error && !loading && data && data.entries.length > 0 && (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Player</th>
                  <th style={styles.thRight}>Wins</th>
                  <th style={styles.thRight}>Win %</th>
                  <th style={styles.thRight}>Tricks %</th>
                  <th style={styles.thRight}>Bids %</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry, i) => (
                  <LeaderboardRow key={entry.userId} entry={entry} rank={offset + i + 1} />
                ))}
              </tbody>
            </table>

            <div style={styles.pagination}>
              <button
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Prev
              </button>
              <span style={{ opacity: 0.55, fontSize: "0.85rem" }}>
                Page {page} of {totalPages}
              </span>
              <button
                style={page >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
