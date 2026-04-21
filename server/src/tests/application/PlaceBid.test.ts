import { placeBid } from "../../application/PlaceBid";
import GameState from "../../domain/entities/GameState";
import { BiddingHand, TrumpSelectHand, createWaitingHand, startBidding } from "../../domain/entities/HandCycle";
import { Player } from "../../domain/entities/Player";
import { Hand } from "../../domain/entities/Hand";
import { InvalidBidError, WrongPhaseError } from "../../domain/errors/GameErrors";
import { GameId, PlayerId, UserId } from "../../types/id-declarations";

// Dealer = p1 (index 0) → bidding order: p2, p3, p4, p1
function makeBiddingGame(): GameState {
    const ids = ["p1", "p2", "p3", "p4"] as PlayerId[];
    const players = ids.map((id, i) =>
        new Player(id, `user${i + 1}`, id as unknown as UserId, new Hand(), false, true, false, 0, i + 1)
    );
    const handCycle = startBidding(createWaitingHand("p1" as PlayerId), players);
    return new GameState("g1" as GameId, players, "g1", handCycle, 0, 0);
}

describe("placeBid", () => {
    it("throws WrongPhaseError when game is not in bidding phase", () => {
        const game = makeBiddingGame();
        (game as any).handCycle = { phase: "playing" };
        expect(() => placeBid(game, "p2" as PlayerId, 5)).toThrow(WrongPhaseError);
    });

    it("throws InvalidBidError when it is not the player's turn", () => {
        const game = makeBiddingGame();
        // First bidder is p2 (left of dealer p1)
        expect(() => placeBid(game, "p1" as PlayerId, 5)).toThrow(InvalidBidError);
    });

    it("throws InvalidBidError for a bid below the minimum of 4", () => {
        const game = makeBiddingGame();
        expect(() => placeBid(game, "p2" as PlayerId, 3)).toThrow(InvalidBidError);
    });

    it("throws InvalidBidError when bid does not exceed the current highest", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 6);
        expect(() => placeBid(game, "p3" as PlayerId, 6)).toThrow(InvalidBidError);
    });

    it("records a valid bid, updates highest, and advances turn to the next player", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 5);
        const hand = game.handCycle as BiddingHand;
        expect(hand.biddingCycle.playerBids["p2" as PlayerId]).toBe(5);
        expect(hand.biddingCycle.highestBid).toBe(5);
        expect(hand.biddingCycle.highestBidderId).toBe("p2");
        expect(hand.biddingCycle.currentBidderId).toBe("p3");
    });

    it("records a pass (0) and advances turn without changing the highest bid", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 0);
        const hand = game.handCycle as BiddingHand;
        expect(hand.biddingCycle.playerBids["p2" as PlayerId]).toBe(0);
        expect(hand.biddingCycle.highestBid).toBe(0);
        expect(hand.biddingCycle.currentBidderId).toBe("p3");
    });

    it("transitions to 'trumpselection' when all 4 players have bid", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 5);
        placeBid(game, "p3" as PlayerId, 6);
        placeBid(game, "p4" as PlayerId, 7);
        placeBid(game, "p1" as PlayerId, 0);
        expect(game.handCycle.phase).toBe("trumpselection");
        const hand = game.handCycle as TrumpSelectHand;
        expect(hand.bidWinnerId).toBe("p4");
        expect(hand.bidAmount).toBe(7);
    });

    it("shoot the moon (bid 11) ends bidding immediately and sets the bid winner", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 11);
        expect(game.handCycle.phase).toBe("trumpselection");
        const hand = game.handCycle as TrumpSelectHand;
        expect(hand.bidWinnerId).toBe("p2");
        expect(hand.bidAmount).toBe(11);
    });

    it("throws WrongPhaseError when attempting to bid after the hand has already transitioned", () => {
        const game = makeBiddingGame();
        placeBid(game, "p2" as PlayerId, 11);
        expect(() => placeBid(game, "p3" as PlayerId, 0)).toThrow(WrongPhaseError);
    });
});
