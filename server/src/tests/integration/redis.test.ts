import { RedisMemoryServer } from "redis-memory-server";
import { createClient } from "redis";

import { RedisShortTermAdapter } from "../../adapters/persistence/RedisShortTermAdapter";
import GameState from "../../domain/entities/GameState";
import { HandCycle } from "../../domain/entities/HandCycle";
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

});