import WebSocketController from "../../../adapters/websockets/WebSocketController";
function createMockSocket() {
  return {
    handshake: { auth: { token: "valid-token" } },
    on: jest.fn(),
    join: jest.fn(),
    user: { userId: "user1" }
  } as any;
}

function createMockServer() {
  return {
    use: jest.fn(),
    on: jest.fn()
  } as any;
}

function createMockAuthAdapter() {
  return {
    verifyToken: jest.fn()
  };
}

function createMockGameService() {
  return {
    placeBid: jest.fn().mockResolvedValue(true),
    playCard: jest.fn().mockResolvedValue(true)
  };
}

describe("WebSocketController", () => {
  it("registers middleware and connection handler", () => {
    const server = createMockServer();
    const auth = createMockAuthAdapter();
    const gameService = createMockGameService();

    new WebSocketController(server, auth as any, gameService as any);

    expect(server.use).toHaveBeenCalled();
    expect(server.on).toHaveBeenCalledWith("connection", expect.any(Function));
  });

  it("authenticates valid token", () => {
  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    createMockGameService() as any
  );

  const socket = createMockSocket();
  const next = jest.fn();

  controller["authAdapter"].verifyToken = jest.fn().mockReturnValue({ userId: "user1" });

  controller.socketAuth(socket, next);

  expect(socket.user).toEqual({ userId: "user1" });
  expect(next).toHaveBeenCalledWith();
});

it("rejects invalid token", () => {
  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    createMockGameService() as any
  );

  const socket = createMockSocket();
  const next = jest.fn();

  controller["authAdapter"].verifyToken = jest.fn(() => {
    throw new Error("bad token");
  });

  controller.socketAuth(socket, next);

  expect(next).toHaveBeenCalledWith(expect.any(Error));
});

it("registers socket event handlers", () => {
  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    createMockGameService() as any
  );

  const socket = createMockSocket();

  controller.registerSocketHandlers(socket);

  expect(socket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
  expect(socket.on).toHaveBeenCalledWith("MessageEvent", expect.any(Function));
  expect(socket.on).toHaveBeenCalledWith("PlaceBidEvent", expect.any(Function));
  expect(socket.on).toHaveBeenCalledWith("PlayCardEvent", expect.any(Function));

  expect(socket.join).toHaveBeenCalledWith("player:user1");
});

it("calls gameService.placeBid on valid PlaceBidEvent", async () => {
  const gameService = createMockGameService();

  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    gameService as any
  );

  const user = { userId: "user1" };

  const data = JSON.stringify({
    gameId: "game1",
    bidAmount: 5
  });

  await controller.onPlaceBidEvent(user as any, data);

  expect(gameService.placeBid).toHaveBeenCalled();
});

it("rejects invalid PlaceBidEvent payload", async () => {
  const gameService = createMockGameService();

  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    gameService as any
  );

  const user = { userId: "user1" };

  const data = JSON.stringify({
    bidAmount: 5 // missing gameId
  });

  await controller.onPlaceBidEvent(user as any, data);

  expect(gameService.placeBid).not.toHaveBeenCalled();
});

it("calls gameService.playCard on valid PlayCardEvent", async () => {
  const gameService = createMockGameService();

  const controller = new WebSocketController(
    createMockServer(),
    createMockAuthAdapter() as any,
    gameService as any
  );

  const user = { userId: "user1" };

  const data = JSON.stringify({
    gameId: "game1",
    suit: 1,
    value: 10
  });

  await controller.onPlayCardEvent(user as any, data);

  expect(gameService.playCard).toHaveBeenCalled();
});


});

