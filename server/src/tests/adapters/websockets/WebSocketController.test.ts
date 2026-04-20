import WebSocketController from "../../../adapters/websockets/WebSocketController";

function createMockSocket() {
    return {
        handshake: { auth: { token: "valid-token" } },
        on: jest.fn(),
        join: jest.fn(),
        user: { userId: "user1" },
    } as any;
}

function createMockServer() {
    return {
        use: jest.fn(),
        on: jest.fn(),
    } as any;
}

function createMockAuthAdapter() {
    return { verifyToken: jest.fn() };
}

function createMockGameService() {
    return {
        placeBid: jest.fn().mockResolvedValue(undefined),
        playCard: jest.fn().mockResolvedValue(undefined),
        pickSuit: jest.fn().mockResolvedValue(undefined),
        discardHandCard: jest.fn().mockResolvedValue(undefined),
        blindCard: jest.fn().mockResolvedValue(undefined),
    };
}

describe("WebSocketController", () => {
    it("registers middleware and a connection handler on construction", () => {
        const server = createMockServer();
        new WebSocketController(server, createMockAuthAdapter() as any, createMockGameService() as any);
        expect(server.use).toHaveBeenCalled();
        expect(server.on).toHaveBeenCalledWith("connection", expect.any(Function));
    });

    it("authenticates a valid token and attaches user to socket", () => {
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            createMockGameService() as any,
        );
        const socket = createMockSocket();
        const next = jest.fn();
        controller["authAdapter"].verifyToken = jest.fn().mockReturnValue({ userId: "user1" });

        controller.socketAuth(socket, next);

        expect(socket.user).toEqual({ userId: "user1" });
        expect(next).toHaveBeenCalledWith();
    });

    it("rejects an invalid token by calling next with an error", () => {
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            createMockGameService() as any,
        );
        const socket = createMockSocket();
        const next = jest.fn();
        controller["authAdapter"].verifyToken = jest.fn(() => { throw new Error("bad token"); });

        controller.socketAuth(socket, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("registers all expected socket event handlers", () => {
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            createMockGameService() as any,
        );
        const socket = createMockSocket();
        controller.registerSocketHandlers(socket);

        const registeredEvents = (socket.on as jest.Mock).mock.calls.map((c: any[]) => c[0]);
        expect(registeredEvents).toContain("disconnect");
        expect(registeredEvents).toContain("PlaceBidEvent");
        expect(registeredEvents).toContain("PlayCardEvent");
        expect(registeredEvents).toContain("PickSuitEvent");
        expect(registeredEvents).toContain("BlindCardEvent");
        expect(registeredEvents).toContain("DiscardHandCardEvent");
        expect(socket.join).toHaveBeenCalledWith("player:user1");
    });

    it("calls gameService.placeBid on a valid PlaceBidEvent", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onPlaceBidEvent(
            { userId: "user1" } as any,
            JSON.stringify({ gameId: "game1", bidAmount: 5 }),
        );
        expect(gameService.placeBid).toHaveBeenCalled();
    });

    it("does not call placeBid when PlaceBidEvent payload is missing gameId", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onPlaceBidEvent(
            { userId: "user1" } as any,
            JSON.stringify({ bidAmount: 5 }),
        );
        expect(gameService.placeBid).not.toHaveBeenCalled();
    });

    it("calls gameService.playCard on a valid PlayCardEvent", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onPlayCardEvent(
            { userId: "user1" } as any,
            JSON.stringify({ gameId: "game1", suit: "SPADES", value: 10 }),
        );
        expect(gameService.playCard).toHaveBeenCalled();
    });

    it("calls gameService.pickSuit on a valid PickSuitEvent", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onPickSuitEvent(
            { userId: "user1" } as any,
            JSON.stringify({ gameId: "game1", suit: "HEARTS" }),
        );
        expect(gameService.pickSuit).toHaveBeenCalled();
    });

    it("does not call pickSuit when suit is invalid", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onPickSuitEvent(
            { userId: "user1" } as any,
            JSON.stringify({ gameId: "game1", suit: "INVALID" }),
        );
        expect(gameService.pickSuit).not.toHaveBeenCalled();
    });

    it("calls gameService.blindCard on a valid BlindCardEvent", async () => {
        const gameService = createMockGameService();
        const controller = new WebSocketController(
            createMockServer(),
            createMockAuthAdapter() as any,
            gameService as any,
        );
        await controller.onBlindCardEvent(
            { userId: "user1" } as any,
            JSON.stringify({ gameId: "game1", action: "keep" }),
        );
        expect(gameService.blindCard).toHaveBeenCalled();
    });
});
