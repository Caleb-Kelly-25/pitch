import { Server } from "socket.io";
import { socketAuth } from "../auth/socketAuth";
import { registerSocketHandlers } from "./register";

export function registerSockets(io: Server) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    socket.emit("Message", "Welcome to the Socket.io server!");

    registerSocketHandlers(socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
}
