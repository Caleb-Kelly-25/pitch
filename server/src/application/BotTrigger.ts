import GameState from "../domain/entities/GameState";
import { BiddingHand, TrumpSelectHand, BlindCardsHand, PlayingHand } from "../domain/entities/HandCycle";
import { GameService } from "./GameService";
import { BidDTO } from "./dto/BidDTO";
import { PickSuitDTO } from "./dto/PickSuitDTO";
import { BlindCardDTO } from "./dto/BlindCardDTO";
import { PlayCardDTO } from "./dto/PlayCardDTO";
import { decideBid, decideSuit, decidePlayCard } from "./BotDecision";
import { PlayerId } from "../types/id-declarations";

function isBot(gameState: GameState, playerId: PlayerId): boolean {
    return gameState.players.find(p => p.id === playerId)?.isBot ?? false;
}

export function triggerBotIfNeeded(gameState: GameState, gameService: GameService): void {
    const gameId = gameState.id as string;
    const phase = gameState.handCycle.phase;

    try {
        if (phase === 'bidding') {
            const hand = gameState.handCycle as BiddingHand;
            const botId = hand.biddingCycle.currentBidderId;
            if (!isBot(gameState, botId)) return;
            const bid = decideBid(gameState, botId);
            setTimeout(() => gameService.placeBid(new BidDTO(gameId, botId, bid)).catch(console.error), 800);

        } else if (phase === 'trumpselection') {
            const hand = gameState.handCycle as TrumpSelectHand;
            const botId = hand.bidWinnerId;
            if (!isBot(gameState, botId)) return;
            const suit = decideSuit(gameState, botId);
            setTimeout(() => gameService.pickSuit(new PickSuitDTO(gameId, botId, suit)).catch(console.error), 800);

        } else if (phase === 'blindcards') {
            const hand = gameState.handCycle as BlindCardsHand;
            const botId = hand.currentRecipientId;
            if (!isBot(gameState, botId)) return;
            setTimeout(() => gameService.blindCard(new BlindCardDTO(gameId, botId, 'done')).catch(console.error), 800);

        } else if (phase === 'playing') {
            const hand = gameState.handCycle as PlayingHand;
            const botId = hand.trick.playerTurn;
            if (!isBot(gameState, botId)) return;
            const card = decidePlayCard(gameState, botId);
            setTimeout(() => gameService.playCard(new PlayCardDTO(gameId, botId, card.suit, card.value)).catch(console.error), 800);
        }
    } catch (err) {
        console.error("BotTrigger error:", err);
    }
}
