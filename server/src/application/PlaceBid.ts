import { BiddingCycle } from "../domain/entities/BiddingCycle";
import GameState from "../domain/entities/GameState";
import { BiddingHand, startTrumpSelection } from "../domain/entities/HandCycle";
import { InvalidBidError, WrongPhaseError } from "../domain/errors/GameErrors";
import { PlayerId } from "../types/id-declarations";

/*
 * Bidding rules:
 *  - null = pass
 *  - Valid bids: 4–11, must exceed the current highest bid
 *  - 11 = "shoot the moon" — auto-passes all remaining bidders and ends bidding immediately
 *  - The dealer is forced by the frontend to bid at least 4 if no one else has bid
 */
export function placeBid(gameState: GameState, playerId: PlayerId, bidAmount: number): void {
    if (gameState.handCycle.phase !== 'bidding') {
        throw new WrongPhaseError('bidding', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle; // narrowed to BiddingHand
    const bc = hand.biddingCycle;

    if (bc.currentBidderId !== playerId) {
        throw new InvalidBidError(`It is not player ${playerId}'s turn to bid`);
    }
    if (!isBidAmountValid(bc.highestBid, bidAmount)) {
        throw new InvalidBidError(`Bid of ${bidAmount} is invalid (current highest: ${bc.highestBid})`);
    }

    if (bidAmount === 11) {
        shootTheMoon(hand, playerId, gameState);
    } else {
        recordBid(hand, playerId, bidAmount, gameState);
    }

    if (isBiddingComplete(gameState, hand)) {
        gameState.handCycle = startTrumpSelection(hand);
    }
}

function isBidAmountValid(currentHighest: number, bidAmount: number): boolean {
    if (bidAmount === 0) return true; // pass
    if (currentHighest === 11) return false; // moon already shot — must pass
    return bidAmount > currentHighest && bidAmount >= 4 && bidAmount <= 11;
}

function recordBid(hand: BiddingHand, playerId: PlayerId, bidAmount: number, gameState: GameState): void {
    const bc = hand.biddingCycle;
    bc.playerBids[playerId] = bidAmount;
    if (bidAmount > bc.highestBid) {
        bc.highestBid = bidAmount;
        bc.highestBidderId = playerId;
    }
    bc.currentBidderId = getNextBidderId(bc, playerId, gameState);
}

function shootTheMoon(hand: BiddingHand, playerId: PlayerId, gameState: GameState): void {
    const bc = hand.biddingCycle;
    bc.highestBid = 11;
    bc.playerBids[playerId] = 11;
    bc.highestBidderId = playerId;

    // Auto-pass everyone who hasn't yet bid
    let nextId = getNextBidderId(bc, playerId, gameState);
    while (nextId !== playerId) {
        if (bc.playerBids[nextId] === undefined) {
            bc.playerBids[nextId] = 0;
        }
        nextId = getNextBidderId(bc, nextId, gameState);
    }
    bc.currentBidderId = playerId;
}

function getNextBidderId(bc: BiddingCycle, currentId: PlayerId, gameState: GameState): PlayerId {
    const ids = gameState.players.map(p => p.id);
    const idx = ids.indexOf(currentId);
    return ids[(idx + 1) % ids.length];
}

function isBiddingComplete(gameState: GameState, hand: BiddingHand): boolean {
    return gameState.players.every(p => hand.biddingCycle.playerBids[p.id] !== undefined);
}
