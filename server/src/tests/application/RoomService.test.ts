import { RoomService } from "../../application/RoomService";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { Suit } from "../../domain/enums/Suit";
import GameState from "../../domain/entities/GameState";
import { Player } from "../../domain/entities/Player";


describe("RoomService.createRoom", () => {
  it("creates a new game state and stores it", async () => {
    const userRepo = {
      findById: jest.fn().mockResolvedValue({ username: "caleb" }),
      updateUser: jest.fn()
    };

    const storage = {
      createGameState: jest.fn(),
      getGameStateById: jest.fn(),
      updateGameState: jest.fn(),
      getAllGameStates: jest.fn()
    };

    const publisher = {
      publishGameStateToRoom: jest.fn()
    };

    const service = new RoomService(storage as any, userRepo as any, publisher as any);

    await service.createRoom("GAME123", "user1");

    expect(storage.createGameState).toHaveBeenCalledTimes(1);

    const created = storage.createGameState.mock.calls[0][0];

    expect(created.players.length).toBe(1);
    expect(created.id).toBe("GAME123");
  });

  it("throws if user does not exist", async () => {
    const userRepo = {
      findById: jest.fn().mockResolvedValue(null),
      updateUser: jest.fn()
    };

    const storage = {
      createGameState: jest.fn()
    };

    const publisher = {
      publishGameStateToRoom: jest.fn()
    };

    const service = new RoomService(storage as any, userRepo as any, publisher as any);

    await expect(service.createRoom("GAME123", "badUser"))
      .rejects.toThrow("User not found");
  });
});

describe("RoomService.joinRoom", () => {
  it("adds a player to a room", async () => {
    const room = {
      id: "GAME1",
      players: [],
      handCycle: {
        handCycleStatus: HandCycleStatus.WAITING
      }
    };

    const userRepo = {
      findById: jest.fn().mockResolvedValue({ username: "bob" }),
      updateUser: jest.fn()
    };

    const storage = {
      getGameStateById: jest.fn().mockResolvedValue(room),
      updateGameState: jest.fn(),
      getAllGameStates: jest.fn()
    };

    const publisher = {
      publishGameStateToRoom: jest.fn()
    };

    const service = new RoomService(storage as any, userRepo as any, publisher as any);

    await service.joinRoom("GAME1", "user1");

    expect(room.players.length).toBe(1);
    expect(storage.updateGameState).toHaveBeenCalled();
    expect(publisher.publishGameStateToRoom).toHaveBeenCalledWith("GAME1", room);
  });

  it("rejects full room", async () => {
    const room = {
      players: [1,2,3,4].map(i => ({ id: "p" + i }))
    };

    const service = new RoomService(
      { getGameStateById: jest.fn().mockResolvedValue(room) } as any,
      {} as any,
      {} as any
    );

    await expect(service.joinRoom("GAME1", "newUser"))
      .rejects.toThrow("Room is full");
  });
});

describe("RoomService.initializeGame", () => {
  it("deals 9 cards per player and sets blind cards", async () => {
    const players = [
      { hand: { cards: [] } },
      { hand: { cards: [] } },
      { hand: { cards: [] } },
      { hand: { cards: [] } }
    ];

    const game = {
      players,
      handCycle: {
        blindCards: []
      }
    };

    const storage = {
      updateGameState: jest.fn()
    };

    const service = new RoomService(storage as any, {} as any, {} as any);

    await service.initializeGame(game as any);

    for (const p of players) {
      expect(p.hand.cards.length).toBe(9);
    }

    expect(game.handCycle.blindCards.length).toBe(54 - 36);
    expect(storage.updateGameState).toHaveBeenCalledWith(game);
  });
});

