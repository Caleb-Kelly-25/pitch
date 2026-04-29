import { useEffect, useState } from "react"
import { motion } from "motion/react"
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

function LeaderboardRow({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <td style={{ ...styles.td, ...styles.rank }}>{rank}</td>
      <td style={styles.td}>{entry.username}</td>
      <td style={styles.tdRight}>{entry.gamesWon}<span style={{ opacity: 0.45, fontWeight: 400 }}>/{entry.gamesCompleted}</span></td>
      <td style={styles.tdRight}>{pct(entry.gamesWon, entry.gamesCompleted)}</td>
      <td style={styles.tdRight}>{pct(entry.tricksWon, entry.tricksPlayed)}</td>
      <td style={styles.tdRight}>{pct(entry.bidsWon, entry.bidsPlayed)}</td>
    </motion.tr>
  )
}

export default function Leaderboard() {
  const { token } = useAuth()
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

        <motion.div
          style={styles.title}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Leaderboard
        </motion.div>
        <motion.div
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          Ranked by games won · all-time
        </motion.div>

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
                  <LeaderboardRow key={entry.userId} entry={entry} rank={offset + i + 1} index={i} />
                ))}
              </tbody>
            </table>

            <motion.div
              style={styles.pagination}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                whileHover={page > 1 ? { scale: 1.05 } : {}}
                whileTap={page > 1 ? { scale: 0.95 } : {}}
              >
                ← Prev
              </motion.button>
              <span style={{ opacity: 0.55, fontSize: "0.85rem" }}>
                Page {page} of {totalPages}
              </span>
              <motion.button
                style={page >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                whileHover={page < totalPages ? { scale: 1.05 } : {}}
                whileTap={page < totalPages ? { scale: 0.95 } : {}}
              >
                Next →
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
