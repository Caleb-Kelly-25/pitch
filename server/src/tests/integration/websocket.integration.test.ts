import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import WebSocketController from "../../adapters/websockets/WebSocketController";

let io: Server;
let httpServer: any;
let port: number;

const mockAuthAdapter = {
    verifyToken: jest.fn().mockReturnValue({ userId: "user1" }),
};

const mockGameService = {
    placeBid:        jest.fn().mockResolvedValue(undefined),
    playCard:        jest.fn().mockResolvedValue(undefined),
    pickSuit:        jest.fn().mockResolvedValue(undefined),
    blindCard:       jest.fn().mockResolvedValue(undefined),
    discardHandCard: jest.fn().mockResolvedValue(undefined),
};

beforeAll((done: () => void) => {
    httpServer = createServer();
    io = new Server(httpServer, { cors: { origin: "*" } });
    new WebSocketController(io, mockAuthAdapter as any, mockGameService as any);
    httpServer.listen(0, () => {
        port = httpServer.address().port;
        done();
    });
});

afterAll(async () => {
    await new Promise<void>(resolve => io.close(() => resolve()));
    await new Promise<void>(resolve => httpServer.close(() => resolve()));
});

afterEach(() => {
    jest.clearAllMocks();
});

function connect(token = "valid-token"): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
        const s = Client(`http://localhost:${port}`, { auth: { token }, forceNew: true });
        s.once("connect",       () => resolve(s));
        s.once("connect_error", reject);
    });
}

describe("WebSocketController integration", () => {
    it("connects and authenticates with a valid token", async () => {
        const s = await connect();
        expect(s.connected).toBe(true);
        s.disconnect();
    });

    it("rejects a connection with an invalid token", (done: () => void) => {
        mockAuthAdapter.verifyToken.mockImplementationOnce(() => { throw new Error("bad token"); });
        const s = Client(`http://localhost:${port}`, { auth: { token: "bad" }, forceNew: true });
        s.once("connect_error", (err: Error) => {
            expect(err.message).toBe("Unauthorized");
            done();
        });
    });

    it("calls gameService.placeBid on PlaceBidEvent", async () => {
        const s = await connect();
        s.emit("PlaceBidEvent", JSON.stringify({ gameId: "g1", bidAmount: 5 }));
        await new Promise(r => setTimeout(r, 80));
        expect(mockGameService.placeBid).toHaveBeenCalled();
        s.disconnect();
    });

    it("does not call placeBid when gameId is missing", async () => {
        const s = await connect();
        s.emit("PlaceBidEvent", JSON.stringify({ bidAmount: 5 }));
        await new Promise(r => setTimeout(r, 80));
        expect(mockGameService.placeBid).not.toHaveBeenCalled();
        s.disconnect();
    });

    it("calls gameService.playCard on PlayCardEvent", async () => {
        const s = await connect();
        s.emit("PlayCardEvent", JSON.stringify({ gameId: "g1", suit: "SPADES", value: 14 }));
        await new Promise(r => setTimeout(r, 80));
        expect(mockGameService.playCard).toHaveBeenCalled();
        s.disconnect();
    });

    it("calls gameService.pickSuit on PickSuitEvent", async () => {
        const s = await connect();
        s.emit("PickSuitEvent", JSON.stringify({ gameId: "g1", suit: "HEARTS" }));
        await new Promise(r => setTimeout(r, 80));
        expect(mockGameService.pickSuit).toHaveBeenCalled();
        s.disconnect();
    });

    it("calls gameService.blindCard on BlindCardEvent", async () => {
        const s = await connect();
        s.emit("BlindCardEvent", JSON.stringify({ gameId: "g1", action: "keep" }));
        await new Promise(r => setTimeout(r, 80));
        expect(mockGameService.blindCard).toHaveBeenCalled();
        s.disconnect();
    });
});
