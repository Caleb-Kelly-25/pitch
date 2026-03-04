import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import { bootstrap, pubClient, subClient } from "./bootstrap";
import { registerSocketHandlers } from "./sockets/register";
import { registerSockets } from "./sockets";

async function startServer() {
    await bootstrap();

    const server = http.createServer(app);

    const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN,
        methods: ["GET", "POST"],
    },
    });

    console.log("Setting up Redis adapter for Socket.io...");
    io.adapter(createAdapter(pubClient, subClient));

    console.log("Registering sockets...");
    registerSockets(io);

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    });
}

startServer().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
