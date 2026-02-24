import "dotenv/config";
import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import { bootstrap, pubClient, subClient } from "./bootstrap";


const PORT_NUM = process.env.PORT || 3000;

// Connect to MongoDB and Redis
await bootstrap();

// Create REST api server
const expressApp = express();
expressApp.use(express.json());
expressApp.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

const httpServer = http.createServer(expressApp);

// Create WebSocket server
const wss = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_ORIGIN,
        methods: ["GET", "POST"],
    },
});


// Start Listening
httpServer.listen(PORT_NUM, () => {
    console.log(`Server listening on port ${PORT_NUM}`);
});
