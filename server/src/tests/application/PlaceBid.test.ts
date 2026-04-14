import { PlaceBid } from "../../application/PlaceBid";
import GameState from "../../domain/entities/GameState";
import { HandCycle } from "../../domain/entities/HandCycle";
import { HandCycleStatus } from "../../domain/enums/HandCycleStatus";
import { PlayerId } from "../../types/id-declarations";

function createGame(currentBidderId: string = "p1") {
  const biddingCycle = {
    currentBidderId,
    highestBid: 0,
    highestBidderId: "" as any,
    playerBids: {
      p1: undefined,
      p2: undefined,
      p3: undefined,
      p4: undefined
    }
  };

  const handCycle = new HandCycle(
    "p1" as any,
    "" as any,
    0,
    {} as any,
    [],
    HandCycleStatus.BIDDING,
    0,
    0,
    biddingCycle as any,
    null
  );

  const gameState = {
    id: "game1",
    players: [
      { id: "p1" },
      { id: "p2" },
      { id: "p3" },
      { id: "p4" }
    ],
    handCycle
  } as any;

  return { gameState, biddingCycle };
}

describe("PlaceBid.placeBid", () => {
  it("rejects bids outside BIDDING phase", () => {
    const { gameState } = createGame();

    gameState.handCycle.handCycleStatus = HandCycleStatus.PLAYING;

    const result = PlaceBid.placeBid(gameState, "p1" as PlayerId, 5);

    expect(result).toBeNull();
  });

  it("rejects bid when not player's turn", () => {
    const { gameState } = createGame("p2");

    const result = PlaceBid.placeBid(gameState, "p1" as PlayerId, 5);

    expect(result).toBeNull();
  });


it("updates highest bid and advances turn", () => {
  const { gameState } = createGame("p1");

  const result = PlaceBid.placeBid(gameState, "p1" as PlayerId, 5);

  expect(result).not.toBeNull();

  const bidding = gameState.handCycle.biddingCycle;

  expect(bidding.playerBids["p1"]).toBe(5);
  expect(bidding.highestBid).toBe(5);
  expect(bidding.highestBidderId).toBe("p1");

  expect(bidding.currentBidderId).toBe("p2");
});

it("rejects bids below minimum or below current bid", () => {
  const { gameState } = createGame("p1");

  const result = PlaceBid.placeBid(gameState, "p1" as PlayerId, 3);

  expect(result).toBeNull();
});

it("handles shooting the moon (bid = 11)", () => {
  const { gameState } = createGame("p1");

  const result = PlaceBid.placeBid(gameState, "p1" as PlayerId, 11);

  const bidding = gameState.handCycle.biddingCycle;

  expect(bidding.highestBid).toBe(11);
  expect(bidding.playerBids["p1"]).toBe(11);
  expect(bidding.highestBidderId).toBe("p1");

  // others should be forced to 0
  expect(bidding.playerBids["p2"]).toBe(0);
  expect(bidding.playerBids["p3"]).toBe(0);
  expect(bidding.playerBids["p4"]).toBe(0);
});

it("transitions to PLAYING when bidding is complete", () => {
  const { gameState } = createGame("p1");

  // simulate all players bidding
  PlaceBid.placeBid(gameState, "p1" as PlayerId, 5);
  PlaceBid.placeBid(gameState, "p2" as PlayerId, 6);
  PlaceBid.placeBid(gameState, "p3" as PlayerId, 7);
  PlaceBid.placeBid(gameState, "p4" as PlayerId, 8);

  expect(gameState.handCycle.handCycleStatus).toBe(
    HandCycleStatus.PLAYING
  );
});





});

