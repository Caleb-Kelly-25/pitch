import { Socket } from "socket.io";
import { verifyToken } from "./jwt";

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  console.log("Performing authorization for token:", token);

  if (!token) return next(new Error("Unauthorized"));

  try {
    const payload = verifyToken(token);
    socket.user = payload; // safe: JWT is trusted
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
