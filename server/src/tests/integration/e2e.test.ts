/**
 * End-to-end test: 4 users register, create/join a game room, then play
 * through all phases (bidding → trump selection → blind cards → playing)
 * until the game reaches COMPLETE — using only in-memory adapters.
 */

import http from "http";
import express from "express";
import { Server } from "socket.io";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import request from "supertest";
import * as jwt from "jsonwebtoken";

import InMemoryShortTermStorageAdapter from "../../adapters/persistence/InMemoryShortTerm";
import InMemoryLongTermStorageAdapter   from "../../adapters/persistence/InMemoryLongTerm";
import WSPublisherAdapter               from "../../adapters/websockets/WSPublisherAdapter";
import JwtAuthAdapter                   from "../../adapters/auth/JwtAuthAdapter";
import WebSocketController              from "../../adapters/websockets/WebSocketController";
import UserController                   from "../../adapters/rest/UserController";
import UserService                      from "../../application/UserService";
import { GameService }                  from "../../application/GameService";
import RoomController                   from "../../adapters/rest/RoomController";
import { RoomService }                  from "../../application/RoomService";
import createRouter                     from "../../adapters/rest/CreateRouter";

// ── constants ─────────────────────────────────────────────────────────────────

const GAME_CODE = "E2ETEST";
const USERS = [
    { username: "alice", password: "pw1" },
    { username: "bob",   password: "pw2" },
    { username: "carol", password: "pw3" },
    { username: "dave",  password: "pw4" },
];

// ── server builder ────────────────────────────────────────────────────────────

function buildServer() {
    process.env.JWT_SECRET = "e2e-secret";

    const app        = express();
    app.use(express.json());

    const httpServer = http.createServer(app);
    const wss        = new Server(httpServer, { cors: { origin: "*" } });

    const shortStorage = new InMemoryShortTermStorageAdapter();
    const longStorage  = new InMemoryLongTermStorageAdapter();
    const authAdapter  = new JwtAuthAdapter();
    const publisher    = new WSPublisherAdapter(wss);

    // GameService takes (gameStateRepository, gamePub) — no longStorage
    new WebSocketController(wss, authAdapter,
        new GameService(shortStorage, publisher));

    app.use("/api", createRouter(
        new UserController(new UserService(longStorage), authAdapter),
        new RoomController(new RoomService(shortStorage, longStorage, publisher), authAdapter),
    ));

    return { app, httpServer, wss };
}

// ── async helpers ─────────────────────────────────────────────────────────────

function nextUpdate(s: ClientSocket): Promise<any> {
    return new Promise(resolve => s.once("gameStateUpdate", resolve));
}

/**
 * Emit an event from one user's socket and collect the resulting
 * gameStateUpdate from every socket (keyed by userId).
 * Returns null if no update arrives within timeoutMs.
 */
function act(
    userId: string,
    event: string,
    payload: object,
    sockets: ClientSocket[],
    userIds: string[],
    socketByUser: Record<string, ClientSocket>,
    timeoutMs = 800,
): Promise<Record<string, any> | null> {
    return new Promise(resolve => {
        let settled = false;
        const cleanup = () => sockets.forEach(s => s.removeAllListeners("gameStateUpdate"));

        const timer = setTimeout(() => {
            if (!settled) { settled = true; cleanup(); resolve(null); }
        }, timeoutMs);

        const pending = sockets.map((s, i) =>
            new Promise<{ uid: string; view: any }>(r =>
                s.once("gameStateUpdate", v => r({ uid: userIds[i], view: v }))
            )
        );

        socketByUser[userId].emit(event, JSON.stringify({ gameId: GAME_CODE, ...payload }));

        Promise.all(pending).then(results => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(Object.fromEntries(results.map(r => [r.uid, r.view])));
            }
        });
    });
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe("E2E: full 4-player game from registration to COMPLETE", () => {
    let httpServer: http.Server;
    let wss: Server;
    let app: express.Application;
    let port: number;

    let tokens:       string[]                         = [];
    let userIds:      string[]                         = [];
    let sockets:      ClientSocket[]                   = [];
    let socketByUser: Record<string, ClientSocket>     = {};

    beforeAll(async () => {
        ({ app, httpServer, wss } = buildServer());
        await new Promise<void>(resolve => httpServer.listen(0, resolve));
        port = (httpServer.address() as any).port;
    });

    afterAll(async () => {
        sockets.forEach(s => s.disconnect());
        await new Promise<void>(r => wss.close(() => r()));
        await new Promise<void>(r => httpServer.close(() => r()));
    });

    // ── Step 1: register 4 users ──────────────────────────────────────────────

    it("registers 4 users via POST /api/auth/signup", async () => {
        for (const u of USERS) {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({ username: u.username, password: u.password });

            expect(res.status).toBe(201);
            expect(res.body.token).toBeTruthy();
            tokens.push(res.body.token);
        }
    });

    // ── Step 2: decode user IDs from tokens ───────────────────────────────────

    it("decodes userId from each JWT token", () => {
        for (const token of tokens) {
            const payload = jwt.decode(token) as any;
            expect(payload?.userId).toBeTruthy();
            userIds.push(payload.userId);
        }
        expect(userIds).toHaveLength(4);
    });

    // ── Step 3: user 0 creates the game room ──────────────────────────────────

    it("user 0 creates a game room via POST /api/game/create", async () => {
        const res = await request(app)
            .post("/api/game/create")
            .set("Authorization", `Bearer ${tokens[0]}`)
            .send({ gameCode: GAME_CODE });

        expect(res.status).toBe(201);
    });

    // ── Step 4: all 4 sockets connect ────────────────────────────────────────

    it("all 4 users connect WebSockets", async () => {
        sockets = await Promise.all(tokens.map(token =>
            new Promise<ClientSocket>((resolve, reject) => {
                const s = ioc(`http://localhost:${port}`, { auth: { token }, forceNew: true });
                s.once("connect",       () => resolve(s));
                s.once("connect_error", reject);
            })
        ));
        for (let i = 0; i < 4; i++) socketByUser[userIds[i]] = sockets[i];
        expect(sockets).toHaveLength(4);
    });

    // ── Step 5: users 1–2 join (game not yet full) ────────────────────────────

    it("users 1 and 2 join without starting the game", async () => {
        for (const i of [1, 2]) {
            // Collect the WAITING-phase events so they don't bleed into step 6
            const participantCount = i + 1; // users 0..i receive the update
            const drained = Promise.all(sockets.slice(0, participantCount).map(nextUpdate));

            const res = await request(app)
                .post("/api/game/join")
                .set("Authorization", `Bearer ${tokens[i]}`)
                .send({ gameCode: GAME_CODE });

            expect(res.status).toBe(200);
            await drained; // consume WAITING events before next join
        }
    });

    // ── Step 6: 4th join triggers game start ─────────────────────────────────

    it("4th join starts the game; all sockets receive a BIDDING gameStateUpdate", async () => {
        const updatePromise = Promise.all(sockets.map(nextUpdate));

        const res = await request(app)
            .post("/api/game/join")
            .set("Authorization", `Bearer ${tokens[3]}`)
            .send({ gameCode: GAME_CODE });

        expect(res.status).toBe(200);

        const updates = await updatePromise;
        for (const u of updates) {
            expect(u.phase).toBe("BIDDING");
            expect(u.gameId).toBe(GAME_CODE);
            expect(u.hand).toHaveLength(9);
        }
    });

    // ── Step 7: play the complete game ────────────────────────────────────────

    it("plays a complete game: bidding → trump selection → blind cards → playing → COMPLETE", async () => {
        let views: Record<string, any> = {};

        function emit(userId: string, event: string, payload: object) {
            return act(userId, event, payload, sockets, userIds, socketByUser);
        }

        // ── Discover the first bidder ──────────────────────────────────────
        let firstBidderIdx = -1;
        for (let i = 0; i < 4; i++) {
            const result = await emit(userIds[i], "PlaceBidEvent", { bidAmount: 4 });
            if (result) {
                views = result;
                firstBidderIdx = i;
                break;
            }
        }
        expect(firstBidderIdx).not.toBe(-1);

        // ── Remaining 3 players pass ───────────────────────────────────────
        for (let offset = 1; offset <= 3; offset++) {
            const uid = userIds[(firstBidderIdx + offset) % 4];
            const result = await emit(uid, "PlaceBidEvent", { bidAmount: 0 });
            expect(result).not.toBeNull();
            views = result!;
        }

        // After all 4 bids, game is in TRUMP_SELECTION
        expect(views[userIds[0]].phase).toBe("TRUMP_SELECTION");

        // ── Main game loop ─────────────────────────────────────────────────
        let phase        = views[userIds[0]].phase as string;
        let bidsThisHand = 0;
        let guard        = 2000; // safety cap

        while (phase !== "COMPLETE" && guard-- > 0) {
            let result: Record<string, any> | null = null;

            if (phase === "BIDDING") {
                const turn = views[userIds[0]].bidding?.currentBidderId as string;
                if (!turn) { console.error("E2E: no currentBidderId"); break; }
                const bidAmount = bidsThisHand === 0 ? 4 : 0;
                bidsThisHand = (bidsThisHand + 1) % 4;
                result = await emit(turn, "PlaceBidEvent", { bidAmount });

            } else if (phase === "TRUMP_SELECTION") {
                const turn = views[userIds[0]].bidWinnerId as string;
                if (!turn) { console.error("E2E: no bidWinnerId (trump)"); break; }
                bidsThisHand = 0;
                result = await emit(turn, "PickSuitEvent", { suit: "HEARTS" });

            } else if (phase === "BLIND_CARDS") {
                const turn = views[userIds[0]].bidWinnerId as string;
                if (!turn) { console.error("E2E: no bidWinnerId (blind)"); break; }
                result = await emit(turn, "BlindCardEvent", { action: "keep" });

            } else if (phase === "PLAYING") {
                const turn = views[userIds[0]].trick?.playerTurn as string;
                if (!turn) { console.error("E2E: no playerTurn"); break; }
                bidsThisHand = 0;
                const hand: { suit: string; value: number }[] = views[turn]?.hand ?? [];
                // HEARTS trump: valid cards are HEARTS-suit, JOKER (value 11), or jick (DIAMONDS JACK = value 12)
                const isTrump = (c: { suit: string; value: number }) =>
                    c.suit === "HEARTS" || c.value === 11 || (c.suit === "DIAMONDS" && c.value === 12);
                const card = hand.find(isTrump) ?? hand[0];
                if (!card) { console.error("E2E: no card for turn", turn, "hand", hand); break; }
                result = await emit(turn, "PlayCardEvent", { suit: card.suit, value: card.value });
            }

            if (!result) {
                console.error("E2E: null result in phase", phase, "guard", guard);
                break;
            }
            views = result;
            phase = views[userIds[0]].phase;
        }

        expect(phase).toBe("COMPLETE");
    }, 60_000);
});
