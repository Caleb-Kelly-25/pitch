import { io, Socket } from "socket.io-client"
import { registerGameSocketHandlers } from "../features/game/registerGameSocketHandlers"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket) {
    socket.disconnect()
  }

  socket = io(API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 7,
  })

  registerGameSocketHandlers(socket)

  return socket
}
