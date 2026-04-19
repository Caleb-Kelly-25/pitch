import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { startPlayingFromBlindCards } from "../domain/entities/HandCycle";
import { InvalidPlayError, WrongPhaseError } from "../domain/errors/GameErrors";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { PlayerId } from "../types/id-declarations";

export function processBlindCard(
    gameState: GameState,
    playerId: PlayerId,
    action: 'keep' | 'discard' | 'swap',
    swapSuit?: Suit,
    swapValue?: Value,
): void {
    if (gameState.handCycle.phase !== 'blindcards') {
        throw new WrongPhaseError('blindcards', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle;

    if (hand.bidWinnerId !== playerId) {
        throw new InvalidPlayError(`Only the bid winner interacts with blind cards`);
    }

    if (!hand.currentBlindCard) {
        throw new InvalidPlayError(`No blind card is currently pending`);
    }

    const bidWinner = gameState.players.find(p => p.id === hand.bidWinnerId)!;

    if (action === 'keep') {
        if (bidWinner.hand.cards.length >= 6) {
            throw new InvalidPlayError(`Hand is full — use swap to replace a card`);
        }
        bidWinner.hand.addCard(hand.currentBlindCard);
    } else if (action === 'swap') {
        if (!swapSuit || swapValue === undefined) {
            throw new InvalidPlayError(`Swap requires a card to discard`);
        }
        const cardToDiscard = new Card(swapSuit, swapValue);
        if (!bidWinner.hand.hasCard(cardToDiscard)) {
            throw new InvalidPlayError(`Player does not have that card to discard`);
        }
        bidWinner.hand.removeCard(cardToDiscard);
        bidWinner.hand.addCard(hand.currentBlindCard);
    }
    // 'discard' action: just skip the blind card (no hand change)

    advanceBlindCard(gameState, hand, bidWinner.hand.cards.length);
}

function advanceBlindCard(
    gameState: GameState,
    hand: { blindCards: Card[]; currentBlindCard: Card | null; bidWinnerId: PlayerId; bidAmount: number; dealerId: PlayerId; trumpSuit: any; phase: 'blindcards' },
    bidWinnerCardCount: number,
): void {
    const handFull = bidWinnerCardCount >= 6;

    if (hand.blindCards.length === 0 || handFull) {
        gameState.handCycle = startPlayingFromBlindCards(hand as any);
    } else {
        hand.currentBlindCard = hand.blindCards.pop()!;
    }
}
