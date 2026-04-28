import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>✕</button>

        {error && (
          <div style={{ color: "#e07777", textAlign: "center" }}>{error}</div>
        )}

        {!profile && !error && (
          <div style={{ textAlign: "center", opacity: 0.55 }}>Loading…</div>
        )}

        {profile && (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{profile.username}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.4, marginTop: 2 }}>Player Profile</div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: 1, marginBottom: 8 }}>GAMES</div>
              <StatLine label="Games Played"  value={profile.gamesCompleted} />
              <StatLine label="Games Won"     value={profile.gamesWon} />
              <StatLine label="Win Rate"      value={pct(profile.gamesWon, profile.gamesCompleted)} />
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: 1, marginBottom: 8 }}>TRICKS</div>
              <StatLine label="Tricks Played" value={profile.tricksPlayed} />
              <StatLine label="Tricks Won"    value={profile.tricksWon} />
              <StatLine label="Win Rate"      value={pct(profile.tricksWon, profile.tricksPlayed)} />
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: 1, marginBottom: 8 }}>BIDDING</div>
              <StatLine label="Bids Made"     value={profile.bidsPlayed} />
              <StatLine label="Bids Won"      value={profile.bidsWon} />
              <StatLine label="Win Rate"      value={pct(profile.bidsWon, profile.bidsPlayed)} />
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: 1, marginBottom: 8 }}>CARDS</div>
              <StatLine label="Cards Played"  value={profile.cardsPlayed} />
            </div>

            <button
              style={{
                background: "none", border: "1px solid rgba(245,237,224,0.2)",
                borderRadius: 6, color: "#f5ede0", cursor: "pointer",
                padding: "7px 0", fontSize: "0.85rem", opacity: 0.7,
              }}
              onClick={() => { onClose(); navigate("/leaderboard") }}
            >
              View Leaderboard →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
