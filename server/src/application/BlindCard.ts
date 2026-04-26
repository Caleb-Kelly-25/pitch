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
    action: 'keep' | 'discard' | 'swap' | 'done',
    swapSuit?: Suit,
    swapValue?: Value,
): void {
    if (gameState.handCycle.phase !== 'blindcards') {
        throw new WrongPhaseError('blindcards', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle;

    if (hand.currentRecipientId !== playerId) {
        throw new InvalidPlayError(`It is not your turn to interact with blind cards`);
    }

    if (action === 'done') {
        // Return the currently-shown card to the deck so it can pass to the partner
        if (hand.currentBlindCard) {
            hand.blindCards.push(hand.currentBlindCard);
            hand.currentBlindCard = null;
        }

        const isBidWinner = hand.currentRecipientId === hand.bidWinnerId;
        if (isBidWinner && hand.blindCards.length > 0) {
            const bidWinnerIndex = gameState.players.findIndex(p => p.id === hand.bidWinnerId);
            const partnerIndex = (bidWinnerIndex + 2) % 4;
            hand.currentRecipientId = gameState.players[partnerIndex].id;
            hand.currentBlindCard = hand.blindCards.pop()!;
        } else {
            gameState.handCycle = startPlayingFromBlindCards(hand);
        }
        return;
    }

    if (!hand.currentBlindCard) {
        throw new InvalidPlayError(`No blind card is currently pending`);
    }

    const recipient = gameState.players.find(p => p.id === hand.currentRecipientId)!;

    if (action === 'keep') {
        if (recipient.hand.cards.length >= 6) {
            throw new InvalidPlayError(`Hand is full — use swap to replace a card`);
        }
        recipient.hand.addCard(hand.currentBlindCard);
    } else if (action === 'swap') {
        if (!swapSuit || swapValue === undefined) {
            throw new InvalidPlayError(`Swap requires a card to discard`);
        }
        const cardToDiscard = new Card(swapSuit, swapValue);
        if (!recipient.hand.hasCard(cardToDiscard)) {
            throw new InvalidPlayError(`Player does not have that card to discard`);
        }
        recipient.hand.removeCard(cardToDiscard);
        recipient.hand.addCard(hand.currentBlindCard);
    }
    // 'discard': skip the blind card, no hand change

    // Advance to next card; if deck is empty, transition to playing
    if (hand.blindCards.length === 0) {
        gameState.handCycle = startPlayingFromBlindCards(hand);
    } else {
        hand.currentBlindCard = hand.blindCards.pop()!;
    }
}
