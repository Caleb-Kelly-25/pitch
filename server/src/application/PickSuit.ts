import GameState from "../domain/entities/GameState";
import { startBlindCards, startPlayingFromBlindCards } from "../domain/entities/HandCycle";
import { Suit } from "../domain/enums/Suit";
import { InvalidPlayError, WrongPhaseError } from "../domain/errors/GameErrors";
import { PlayerId } from "../types/id-declarations";

export function pickSuit(gameState: GameState, playerId: PlayerId, suit: Suit): void {
    if (gameState.handCycle.phase !== 'trumpselection') {
        throw new WrongPhaseError('trumpselection', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle;

    if (hand.bidWinnerId !== playerId) {
        throw new InvalidPlayError(`Only the bid winner can select the trump suit`);
    }

    const blindCardsHand = startBlindCards(hand, suit, gameState.players);

    // Skip blind cards phase if there is nothing to show the bid winner
    if (blindCardsHand.currentBlindCard === null) {
        gameState.handCycle = startPlayingFromBlindCards(blindCardsHand);
    } else {
        gameState.handCycle = blindCardsHand;
    }
}
