import { RedisMemoryServer } from "redis-memory-server";
import { createClient } from "redis";

import { RedisShortTermAdapter } from "../../adapters/persistence/RedisShortTermAdapter";
import { withGameState, MAX_ATTEMPTS } from "../../application/CasTransaction";
import GameState from "../../domain/entities/GameState";
import { HandCycle } from "../../domain/entities/HandCycle";
import { GameNotFoundError } from "../../domain/errors/GameErrors";
import { GameId } from "../../types/id-declarations";

let redisServer: RedisMemoryServer;
let client: any;
let adapter: RedisShortTermAdapter;

beforeAll(async () => {
  redisServer = new RedisMemoryServer();
  const host = await redisServer.getHost();
  const port = await redisServer.getPort();

  client = createClient({ url: `redis://${host}:${port}` });
  await client.connect();

  adapter = new RedisShortTermAdapter(client);
});

afterAll(async () => {
  await client.quit();
  await redisServer.stop();
});

afterEach(async () => {
  await client.flushAll();
});

function createGameState(id: GameId = "game1" as GameId): GameState {
  return {
    id,
    players: [],
    gameCode: id,
    handCycle: { phase: "waiting", dealerId: null } as unknown as HandCycle,
    teamOneScore: 0,
    teamTwoScore: 0,
    lastHandResult: null,
    version: 0,
  } as GameState;
}

describe("RedisShortTermAdapter", () => {
    it("creates and stores a game state", async () => {
  const state = createGameState();

  await adapter.createGameState(state);

  const stored = await client.get(state.id);

  expect(stored).not.toBeNull();
});

it("retrieves a stored game state", async () => {
  const state = createGameState();

  await adapter.createGameState(state);

  const result = await adapter.getGameStateById(state.id);

  expect(result).not.toBeNull();
  expect(result!.id).toBe(state.id);
});

it("updates an existing game state", async () => {
  const state = createGameState();

  await adapter.createGameState(state);

  state.teamOneScore = 10;
  state.version = 1;

  const committed = await adapter.updateGameState(state.id, 0, state);

  expect(committed).toBe(true);

  const updated = await adapter.getGameStateById(state.id);

  expect(updated!.teamOneScore).toBe(10);
  expect(updated!.version).toBe(1);
});

it("deletes a game state", async () => {
  const state = createGameState();

  await adapter.createGameState(state);

  await adapter.deleteGameState(state.id);

  const result = await adapter.getGameStateById(state.id);

  expect(result).toBeNull();
});

it("returns all stored game states", async () => {
  await adapter.createGameState(createGameState("g1" as GameId));
  await adapter.createGameState(createGameState("g2" as GameId));

  const all = await adapter.getAllGameStates();

  expect(all.length).toBe(2);
});

it("sets expiration on stored game state", async () => {
  const state = createGameState();

  await adapter.createGameState(state);

  const ttl = await client.ttl(state.id);

  expect(ttl).toBeGreaterThan(0);
});

it("assigns a UUID when createGameState is called with no id", async () => {
  const state = createGameState("" as GameId);

  await adapter.createGameState(state);

  expect(state.id).toBeTruthy();
  const stored = await client.get(state.id);
  expect(stored).not.toBeNull();
});

it("returns empty array from getAllGameStates when Redis is empty", async () => {
  const all = await adapter.getAllGameStates();
  expect(all).toEqual([]);
});

});

// ── compare-and-swap semantics ────────────────────────────────────────────────

describe("RedisShortTermAdapter compare-and-swap", () => {
  it("commits a write made against the current version", async () => {
    const state = createGameState();
    await adapter.createGameState(state);

    state.version = 1;
    state.teamOneScore = 7;

    await expect(adapter.updateGameState(state.id, 0, state)).resolves.toBe(true);
    expect((await adapter.getGameStateById(state.id))!.teamOneScore).toBe(7);
  });

  it("rejects a write made against a stale version and leaves state untouched", async () => {
    const state = createGameState();
    await adapter.createGameState(state);

    // Someone else commits version 0 → 1 first
    const winner = createGameState();
    winner.version = 1;
    winner.teamOneScore = 10;
    await adapter.updateGameState(winner.id, 0, winner);

    // The loser still believes it is working from version 0
    const loser = createGameState();
    loser.version = 1;
    loser.teamOneScore = 99;

    await expect(adapter.updateGameState(loser.id, 0, loser)).resolves.toBe(false);

    const stored = await adapter.getGameStateById(state.id);
    expect(stored!.teamOneScore).toBe(10); // winner's write survived intact
    expect(stored!.version).toBe(1);
  });

  it("throws GameNotFoundError rather than reporting a conflict when the key is gone", async () => {
    const state = createGameState();
    await adapter.createGameState(state);
    await adapter.deleteGameState(state.id);

    // Must not come back as `false` — retrying an expired game is pointless
    await expect(adapter.updateGameState(state.id, 0, state)).rejects.toThrow(GameNotFoundError);
  });

  it("refreshes the TTL on a successful compare-and-swap", async () => {
    const state = createGameState();
    await adapter.createGameState(state);
    await client.expire(state.id, 30);

    state.version = 1;
    await adapter.updateGameState(state.id, 0, state);

    expect(await client.ttl(state.id)).toBeGreaterThan(30);
  });

  it("lets exactly one of two concurrent writers commit", async () => {
    const state = createGameState();
    await adapter.createGameState(state);

    // Both read version 0, both mutate, both try to commit
    const [a, b] = await Promise.all([
      adapter.getGameStateById(state.id),
      adapter.getGameStateById(state.id),
    ]);
    a!.teamOneScore = 1;
    a!.version = 1;
    b!.teamTwoScore = 2;
    b!.version = 1;

    const results = await Promise.all([
      adapter.updateGameState(state.id, 0, a!),
      adapter.updateGameState(state.id, 0, b!),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect((await adapter.getGameStateById(state.id))!.version).toBe(1);
  });

  it("withGameState lands every concurrent transition exactly once", async () => {
    const state = createGameState();
    await adapter.createGameState(state);
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await Promise.all(Array.from({ length: MAX_ATTEMPTS }, () =>
      withGameState(adapter, state.id, gs => { gs.teamOneScore += 1; })
    ));

    const stored = (await adapter.getGameStateById(state.id))!;
    expect(stored.teamOneScore).toBe(MAX_ATTEMPTS);
    expect(stored.version).toBe(MAX_ATTEMPTS);
  });
});

describe("RedisShortTermAdapter error handling", () => {
  function brokenAdapter(overrides: Partial<Record<string, () => Promise<any>>> = {}) {
    const fail = () => Promise.reject(new Error("Redis error"));
    const brokenClient = {
      set:  overrides["set"]  ?? fail,
      get:  overrides["get"]  ?? fail,
      del:  overrides["del"]  ?? fail,
      keys: overrides["keys"] ?? fail,
      eval: overrides["eval"] ?? fail,
    };
    return new RedisShortTermAdapter(brokenClient as any);
  }

  // Deliberately unlike its siblings below: a swallowed error here would be
  // returned as `false`, which callers read as "someone beat me to it, retry" —
  // turning an outage into a silent stream of pointless retries.
  it("updateGameState propagates Redis errors instead of swallowing them", async () => {
    await expect(brokenAdapter().updateGameState("x", 0, { id: "x" } as any)).rejects.toThrow("Redis error");
  });

  it("createGameState swallows Redis errors", async () => {
    await expect(brokenAdapter().createGameState({ id: "x" } as any)).resolves.toBeUndefined();
  });

  it("getGameStateById returns null on Redis error", async () => {
    await expect(brokenAdapter().getGameStateById("x")).resolves.toBeNull();
  });

  it("deleteGameState swallows Redis errors", async () => {
    await expect(brokenAdapter().deleteGameState("x")).resolves.toBeUndefined();
  });

  it("getAllGameStates returns empty array on Redis error", async () => {
    await expect(brokenAdapter().getAllGameStates()).resolves.toEqual([]);
  });
});