import "dotenv/config";

const fmtArg = (a: unknown): string => {
  if (a instanceof Error) return (a.stack ?? a.message).replace(/\n/g, " | ");
  if (typeof a === "object" && a !== null) return JSON.stringify(a);
  return String(a);
};
for (const level of ["log", "error", "warn", "info"] as const) {
  const orig = console[level].bind(console);
  console[level] = (...args: unknown[]) => orig(args.map(fmtArg).join(" "));
}

import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import { bootstrap, pubClient, subClient, storageClient } from "./bootstrap";
import { createAdapter } from "@socket.io/redis-adapter";
import createRouter from "./adapters/rest/CreateRouter";
import WSPublisherAdapter from "./adapters/websockets/WSPublisherAdapter";
import { MongoLongTermAdapter } from "./adapters/persistence/MongoLongTermAdapter";
import { RedisShortTermAdapter } from "./adapters/persistence/RedisShortTermAdapter";
import JwtAuthAdapter from "./adapters/auth/JwtAuthAdapter";
import WebSocketController from "./adapters/websockets/WebSocketController";
import UserController from "./adapters/rest/UserController";
import UserService from "./application/UserService";
import UserProfileService from "./application/UserProfileService";
import {GameService} from "./application/GameService"
import RoomController from "./adapters/rest/RoomController";
import ProfileController from "./adapters/rest/ProfileController";
import { RoomService } from "./application/RoomService";
import { triggerBotIfNeeded } from "./application/BotTrigger";


const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PORT_NUM = process.env.PORT || 3000;

async function startServer() {
  // Connect to MongoDB and Redis
  await bootstrap();

  // Create REST api server
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(
    cors({
      origin: CLIENT_ORIGIN,
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

  // Attach Redis adapter for horizontal scaling
  wss.adapter(createAdapter(pubClient, subClient));

  // Adapters
  const wsPublisher = new WSPublisherAdapter(wss);
  const shortStorage = new RedisShortTermAdapter(storageClient); // InMemoryShortTermStorageAdapter();
  const longStorage = new MongoLongTermAdapter(); // InMemoryLongTermStorageAdapter();
  const authAdapter = new JwtAuthAdapter();

  const userService = new UserService(longStorage);
  const profileService = new UserProfileService(longStorage);
  const gameService = new GameService(shortStorage, wsPublisher, profileService);
  new WebSocketController(wss, authAdapter, gameService);
  const userController = new UserController(userService, authAdapter);
  const roomService = new RoomService(shortStorage, longStorage, wsPublisher, (gs) => triggerBotIfNeeded(gs, gameService));
  const roomController = new RoomController(roomService, authAdapter);
  const profileController = new ProfileController(profileService, userService, authAdapter);
  expressApp.use("/api", createRouter(userController, roomController, profileController));

  // Start Listening
  httpServer.listen(PORT_NUM, () => {
      console.log(`Server listening on port ${PORT_NUM}`);
  });
}

startServer().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
