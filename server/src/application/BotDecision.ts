import GameState from "../domain/entities/GameState";
import { Card } from "../domain/entities/Card";
import { BiddingHand, PlayingHand } from "../domain/entities/HandCycle";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { PlayerId } from "../types/id-declarations";

export function decideBid(gameState: GameState, botPlayerId: PlayerId): number {
    const hand = gameState.handCycle as BiddingHand;
    const bot = gameState.players.find(p => p.id === botPlayerId)!;
    const { biddingCycle } = hand;

    // Forced dealer bid: bot is dealer and all others passed
    const isDealer = gameState.players.find(p => p.isDealer)?.id === botPlayerId;
    const allOthersPassed = Object.entries(biddingCycle.playerBids)
        .filter(([id]) => id !== (botPlayerId as string))
        .every(([, bid]) => bid === 0);
    if (isDealer && allOthersPassed && biddingCycle.highestBid === 0) return 4;

    // Partner already has the high bid — pass
    const botIndex = gameState.players.findIndex(p => p.id === botPlayerId);
    const partnerId = gameState.players[(botIndex + 2) % 4]?.id;
    if (biddingCycle.highestBidderId === partnerId) return 0;

    // Bid 4 if any suit has 3+ scoring trump cards
    const scoringValues = new Set<Value>([Value.ACE, Value.THREE, Value.TEN, Value.JACK, Value.JOKER]);
    const suits = Object.values(Suit) as Suit[];
    const bestCount = Math.max(...suits.map(suit =>
        bot.hand.cards.filter(c => Card.isSuited(c, suit) && scoringValues.has(c.value)).length
    ));

    if (bestCount >= 3 && biddingCycle.highestBid < 4) return 4;
    return 0;
}

export function decideSuit(gameState: GameState, botPlayerId: PlayerId): Suit {
    const bot = gameState.players.find(p => p.id === botPlayerId)!;
    const suits = Object.values(Suit) as Suit[];
    let best = suits[0];
    let bestCount = -1;
    for (const suit of suits) {
        const count = bot.hand.cards.filter(c => Card.isSuited(c, suit)).length;
        if (count > bestCount) { bestCount = count; best = suit; }
    }
    return best;
}

export function decidePlayCard(gameState: GameState, botPlayerId: PlayerId): Card {
    const hand = gameState.handCycle as PlayingHand;
    const bot = gameState.players.find(p => p.id === botPlayerId)!;
    const trump = hand.trumpSuit;
    const trumpCards = bot.hand.cards.filter(c => Card.isSuited(c, trump));
    if (trumpCards.length === 0) throw new Error(`Bot ${botPlayerId} has no trump cards`);
    trumpCards.sort((a, b) => a.value - b.value);
    return trumpCards[0];
}
