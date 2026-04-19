import { RedisMemoryServer } from "redis-memory-server";
import { createClient } from "redis";

import { RedisShortTermAdapter } from "../../src/adapters/persistence/RedisShortTermAdapter";
import GameState from "../../src/domain/entities/GameState";
import { HandCycle } from "../../src/domain/entities/HandCycle";
import { GameId } from "../../src/types/id-declarations";

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
    handCycle: {} as HandCycle,
    teamOneScore: 0,
    teamTwoScore: 0
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

  await adapter.updateGameState(state);

  const updated = await adapter.getGameStateById(state.id);

  expect(updated!.teamOneScore).toBe(10);
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

describe("RedisShortTermAdapter error handling", () => {
  function brokenAdapter(overrides: Partial<Record<string, () => Promise<any>>> = {}) {
    const fail = () => Promise.reject(new Error("Redis error"));
    const brokenClient = {
      set:  overrides["set"]  ?? fail,
      get:  overrides["get"]  ?? fail,
      del:  overrides["del"]  ?? fail,
      keys: overrides["keys"] ?? fail,
    };
    return new RedisShortTermAdapter(brokenClient as any);
  }

  it("updateGameState swallows Redis errors", async () => {
    await expect(brokenAdapter().updateGameState({ id: "x" } as any)).resolves.toBeUndefined();
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