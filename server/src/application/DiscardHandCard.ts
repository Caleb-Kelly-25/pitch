import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { InvalidPlayError, WrongPhaseError } from "../domain/errors/GameErrors";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { PlayerId } from "../types/id-declarations";

export function discardHandCard(gameState: GameState, playerId: PlayerId, suit: Suit, value: Value): void {
    if (gameState.handCycle.phase !== 'blindcards') {
        throw new WrongPhaseError('blindcards', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle;

    if (hand.bidWinnerId !== playerId) {
        throw new InvalidPlayError(`Only the bid winner can discard hand cards during blind cards phase`);
    }

    const bidWinner = gameState.players.find(p => p.id === playerId)!;
    const card = new Card(suit, value);

    if (!bidWinner.hand.hasCard(card)) {
        throw new InvalidPlayError(`Player does not have that card`);
    }

    bidWinner.hand.removeCard(card);
}
