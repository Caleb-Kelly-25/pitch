import "dotenv/config";
import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import { bootstrap, pubClient, subClient } from "./bootstrap";
import createRouter from "./adapters/rest/CreateRouter";
import WSPublisherAdapter from "./adapters/websockets/WSPublisherAdapter";
import InMemoryShortTermStorageAdapter from "./adapters/persistence/InMemoryShortTerm";
import InMemoryLongTermStorageAdapter from "./adapters/persistence/InMemoryLongTerm";
import { MongoLongTermAdapter } from "./adapters/persistence/MongoLongTermAdapter";
import JwtAuthAdapter from "./adapters/auth/JwtAuthAdapter";
import WebSocketController from "./adapters/websockets/WebSocketController";
import UserController from "./adapters/rest/UserController";
import UserService from "./application/UserService";


const PORT_NUM = process.env.PORT || 3000;

async function startServer() {
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

// Adapters
const wsPublisher = new WSPublisherAdapter(wss);
const shortStorage = new InMemoryShortTermStorageAdapter();
const longStorage = new MongoLongTermAdapter() // InMemoryLongTermStorageAdapter();
const authAdapter = new JwtAuthAdapter();

const wsController = new WebSocketController(wss, authAdapter);
const userController = new UserController(new UserService(longStorage));
expressApp.use(createRouter(userController));


// Start Listening
httpServer.listen(PORT_NUM, () => {
    console.log(`Server listening on port ${PORT_NUM}`);
});
}

startServer().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
