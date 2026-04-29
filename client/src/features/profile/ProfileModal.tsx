import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { fetchProfile, type UserProfileData } from "./profileService"

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 3000,
}

const card: React.CSSProperties = {
  backgroundColor: "#2d1f1f",
  border: "1px solid rgba(245,237,224,0.15)",
  borderRadius: 14,
  padding: "32px 36px",
  minWidth: 320,
  maxWidth: 420,
  width: "90vw",
  color: "#f5ede0",
  fontFamily: "'Georgia', serif",
  display: "flex",
  flexDirection: "column",
  gap: 20,
}

const closeBtn: React.CSSProperties = {
  alignSelf: "flex-end",
  background: "none",
  border: "none",
  color: "rgba(245,237,224,0.5)",
  fontSize: 22,
  cursor: "pointer",
  lineHeight: 1,
  padding: 0,
}

const statRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  borderBottom: "1px solid rgba(245,237,224,0.08)",
  fontSize: "0.95rem",
}

const statValue: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#f5c06a",
  minWidth: 48,
  textAlign: "right",
}

function pct(num: number, den: number) {
  if (den === 0) return "—"
  return `${Math.round((num / den) * 100)}%`
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statRow}>
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span style={statValue}>{value}</span>
    </div>
  )
}

interface Props {
  userId: string
  token: string
  onClose: () => void
}

export default function ProfileModal({ userId, token, onClose }: Props) {
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile(userId, token)
      .then(setProfile)
      .catch(() => setError("Could not load profile."))
  }, [userId, token])

  return (
    <motion.div
      style={overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        style={card}
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <motion.button
          style={closeBtn}
          onClick={onClose}
          whileHover={{ scale: 1.2, color: "rgba(245,237,224,0.9)" }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>

        {error && (
          <div style={{ color: "#e07777", textAlign: "center" }}>{error}</div>
        )}

        {!profile && !error && (
          <div style={{ textAlign: "center", opacity: 0.55 }}>Loading…</div>
        )}

        {profile && (
          <>
            <motion.div
              style={{ textAlign: "center" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{profile.username}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.4, marginTop: 2 }}>Player Profile</div>
            </motion.div>

            {[
              {
                label: "GAMES",
                delay: 0.1,
                rows: [
                  { label: "Games Played", value: profile.gamesCompleted },
                  { label: "Games Won",    value: profile.gamesWon },
                  { label: "Win Rate",     value: pct(profile.gamesWon, profile.gamesCompleted) },
                ],
              },
              {
                label: "TRICKS",
                delay: 0.16,
                rows: [
                  { label: "Tricks Played", value: profile.tricksPlayed },
                  { label: "Tricks Won",    value: profile.tricksWon },
                  { label: "Win Rate",      value: pct(profile.tricksWon, profile.tricksPlayed) },
                ],
              },
              {
                label: "BIDDING",
                delay: 0.22,
                rows: [
                  { label: "Bids Made", value: profile.bidsPlayed },
                  { label: "Bids Won",  value: profile.bidsWon },
                  { label: "Win Rate",  value: pct(profile.bidsWon, profile.bidsPlayed) },
                ],
              },
              {
                label: "CARDS",
                delay: 0.28,
                rows: [
                  { label: "Cards Played", value: profile.cardsPlayed },
                ],
              },
            ].map(section => (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: section.delay }}
              >
                <div style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: 1, marginBottom: 8 }}>{section.label}</div>
                {section.rows.map(r => <StatLine key={r.label} label={r.label} value={r.value} />)}
              </motion.div>
            ))}

            <motion.button
              style={{
                background: "none", border: "1px solid rgba(245,237,224,0.2)",
                borderRadius: 6, color: "#f5ede0", cursor: "pointer",
                padding: "7px 0", fontSize: "0.85rem", opacity: 0.7,
              }}
              onClick={() => { onClose(); navigate("/leaderboard") }}
              whileHover={{ scale: 1.02, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.34 }}
            >
              View Leaderboard →
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
