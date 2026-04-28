import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { BlindCardsHand, PlayingHand, startPlayingFromBlindCards } from "../domain/entities/HandCycle";
import { InvalidPlayError, WrongPhaseError } from "../domain/errors/GameErrors";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { PlayerId } from "../types/id-declarations";

const BLIND_CARD_POINTS: Partial<Record<Value, number>> = {
    [Value.ACE]: 1,
    [Value.TWO]: 1,
    [Value.THREE]: 3,
    [Value.TEN]: 1,
    [Value.JOKER]: 1,
    [Value.JACK]: 1,
};

function awardPointCardsToOpponents(
    gameState: GameState,
    hand: BlindCardsHand,
    playingHand: PlayingHand,
    cards: Card[],
): void {
    if (cards.length === 0) return;
    const bidWinnerIndex = gameState.players.findIndex(p => p.id === hand.bidWinnerId);
    const opponentTeamIsOne = bidWinnerIndex % 2 !== 0;

    for (const card of cards) {
        const pts = BLIND_CARD_POINTS[card.value] ?? 0;
        if (pts === 0) continue;
        if (opponentTeamIsOne) {
            playingHand.teamOneHandPoints += pts;
            playingHand.teamOneCardsWon.push(card);
        } else {
            playingHand.teamTwoHandPoints += pts;
            playingHand.teamTwoCardsWon.push(card);
        }
    }
}

function transitionToPlaying(gameState: GameState, hand: BlindCardsHand): void {
    const playingHand = startPlayingFromBlindCards(hand);
    // Discarded cards + any cards left in the blind deck all go to opponents as won cards
    awardPointCardsToOpponents(gameState, hand, playingHand, [
        ...hand.discardedCards,
        ...hand.blindCards,
    ]);
    gameState.handCycle = playingHand;
}

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
            transitionToPlaying(gameState, hand);
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
    } else {
        // discard: track it so opponents receive any point value
        hand.discardedCards.push(hand.currentBlindCard);
    }

    hand.currentBlindCard = null;

    if (hand.blindCards.length === 0) {
        transitionToPlaying(gameState, hand);
    } else {
        hand.currentBlindCard = hand.blindCards.pop()!;
    }
}
