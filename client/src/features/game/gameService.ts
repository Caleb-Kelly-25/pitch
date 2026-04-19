import { socket, connectSocket } from "../../lib/socket"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export function playCard(suit: string, value: number, gameId: string) {
  if (!socket) {
    console.log("Socket not connected, can't play card.")
    return
  }
  socket.emit("PlayCardEvent", JSON.stringify({ gameId, playerId: "", suit, value }))
}

export function placeBid(bidAmount: number, gameId: string) {
  if (!socket) {
    console.log("Socket not connected, can't place bid.")
    return
  }
  socket.emit("PlaceBidEvent", JSON.stringify({ gameId, bidAmount }))
}

export function pickSuit(suit: string, gameId: string) {
  if (!socket) {
    console.log("Socket not connected, can't pick suit.")
    return
  }
  socket.emit("PickSuitEvent", JSON.stringify({ gameId, suit }))
}

export function blindCard(action: 'keep' | 'discard' | 'swap', gameId: string, swapSuit?: string, swapValue?: number) {
  if (!socket) {
    console.log("Socket not connected, can't submit blind card decision.")
    return
  }
  socket.emit("BlindCardEvent", JSON.stringify({ gameId, action, swapSuit, swapValue }))
}

export function discardHandCard(suit: string, value: number, gameId: string) {
  if (!socket) {
    console.log("Socket not connected, can't discard hand card.")
    return
  }
  socket.emit("DiscardHandCardEvent", JSON.stringify({ gameId, suit, value }))
}

export function requestUpdate() {
  if (!socket) {
    throw new Error("Socket not connected, can't request update.")
  }
  socket.emit("requestUpdate")
}

export async function createGame(gameCode: string, token: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/game/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameCode }),
  })

  if (res.ok) {
    connectSocket(token)
    return (await res.json()).gameId;
  }
  return "";
}

export async function joinGame(gameCode: string, token: string) {
  const res = await fetch(`${API_URL}/api/game/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameCode }),
  })

  if (res.ok) {
    connectSocket(token)
  }
}
