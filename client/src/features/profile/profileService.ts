const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export interface UserProfileData {
  userId: string
  username: string
  gamesCompleted: number
  gamesWon: number
  cardsPlayed: number
  tricksPlayed: number
  tricksWon: number
  bidsPlayed: number
  bidsWon: number
}

export async function fetchProfile(userId: string, token: string): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/api/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`)
  return res.json()
}

export interface LeaderboardEntry {
  userId: string
  username: string
  gamesCompleted: number
  gamesWon: number
  tricksPlayed: number
  tricksWon: number
  bidsPlayed: number
  bidsWon: number
}

export interface LeaderboardPage {
  entries: LeaderboardEntry[]
  total: number
  page: number
  limit: number
}

export async function fetchLeaderboard(token: string, page = 1, limit = 20): Promise<LeaderboardPage> {
  const res = await fetch(`${API_URL}/api/leaderboard?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`)
  return res.json()
}
