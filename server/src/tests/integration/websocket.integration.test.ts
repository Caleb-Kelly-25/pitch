import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";

import WebSocketController from "../../../src/adapters/websockets/WebSocketController";

let io: Server;
let httpServer: any;
let clientSocket: any;

const PORT = 4000;
const URL = `http://localhost:${PORT}`;

const mockAuthAdapter = {
  verifyToken: jest.fn().mockReturnValue({ userId: "user1" })
};

const mockGameService = {
  placeBid: jest.fn().mockResolvedValue(true),
  playCard: jest.fn().mockResolvedValue(true)
};

beforeAll((done) => {
  httpServer = createServer();
  io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  new WebSocketController(io, mockAuthAdapter as any, mockGameService as any);

  httpServer.listen(PORT, done);
});

afterAll((done) => {
  io.close();
  httpServer.close(done);
});

afterEach(() => {
  jest.clearAllMocks();
});
describe("WebSocketController Integration Tests", () => {
it("connects and authenticates socket", (done) => {
  clientSocket = Client(URL, {
    auth: { token: "valid-token" }
  });

  clientSocket.on("connect", () => {
    expect(clientSocket.connected).toBe(true);
    done();
  });
});

it("handles PlaceBidEvent end-to-end", (done) => {
  clientSocket = Client(URL, {
    auth: { token: "valid-token" }
  });

  clientSocket.on("connect", () => {
    clientSocket.emit("PlaceBidEvent", JSON.stringify({
      gameId: "game1",
      bidAmount: 5
    }));

    setTimeout(() => {
      expect(mockGameService.placeBid).toHaveBeenCalled();
      done();
    }, 50);
  });
});

it("handles PlayCardEvent end-to-end", (done) => {
  clientSocket = Client(URL, {
    auth: { token: "valid-token" }
  });

  clientSocket.on("connect", () => {
    clientSocket.emit("PlayCardEvent", JSON.stringify({
      gameId: "game1",
      suit: 1,
      value: 10
    }));

    setTimeout(() => {
      expect(mockGameService.playCard).toHaveBeenCalled();
      done();
    }, 50);
  });
});

it("rejects invalid PlaceBidEvent payload", (done) => {
  clientSocket = Client(URL, {
    auth: { token: "valid-token" }
  });

  clientSocket.on("connect", () => {
    clientSocket.emit("PlaceBidEvent", JSON.stringify({
      bidAmount: 5 // missing gameId
    }));

    setTimeout(() => {
      expect(mockGameService.placeBid).not.toHaveBeenCalled();
      done();
    }, 50);
  });
});

it("rejects connection with invalid token", (done) => {
  mockAuthAdapter.verifyToken.mockImplementationOnce(() => {
    throw new Error("Invalid token");
  });

  const badClient = Client(URL, {
    auth: { token: "bad-token" }
  });

  badClient.on("connect_error", (err: Error) => {
    expect(err.message).toBe("Unauthorized");
    done();
  });
});

});