import assert from "assert";
import { Card } from "../domain/entities/Card";
import GameState from "../domain/entities/GameState";
import { Hand } from "../domain/entities/Hand";
import { Player } from "../domain/entities/Player";
import { PlayingHand, completeHand, createWaitingHand, startBidding } from "../domain/entities/HandCycle";
import { Trick } from "../domain/entities/Trick";
import { Suit } from "../domain/enums/Suit";
import { Value } from "../domain/enums/Value";
import { InvalidPlayError, WrongPhaseError } from "../domain/errors/GameErrors";
import { PlayerId } from "../types/id-declarations";

const CARD_POINTS: Record<Value, number> = {
    [Value.ACE]: 1,
    [Value.TWO]: 1,
    [Value.THREE]: 3,
    [Value.FOUR]: 0,
    [Value.FIVE]: 0,
    [Value.SIX]: 0,
    [Value.SEVEN]: 0,
    [Value.EIGHT]: 0,
    [Value.NINE]: 0,
    [Value.TEN]: 1,
    [Value.JOKER]: 1,
    [Value.JACK]: 1,
    [Value.QUEEN]: 0,
    [Value.KING]: 0,
};

const CARDS_PER_PLAYER = 9;
const GAME_WIN_THRESHOLD = 52;

export function playCard(gameState: GameState, playerId: PlayerId, card: Card): void {
    if (gameState.handCycle.phase !== 'playing') {
        throw new WrongPhaseError('playing', gameState.handCycle.phase);
    }
    const hand = gameState.handCycle; // narrowed to PlayingHand

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) throw new InvalidPlayError(`Player ${playerId} not found in game`);

    if (hand.trick.playerTurn !== playerId) {
        throw new InvalidPlayError(`Not player ${playerId}'s turn`);
    }

    if (isPlayerOutOfTrump(player, hand.trumpSuit)) {
        // Player has no trump — auto-pass this trick slot
        hand.trick.cardsPlayed[playerId] = null;
    } else {
        if (!player.hand.hasCard(card)) {
            throw new InvalidPlayError(`Player ${playerId} does not have ${card.suit} ${card.value}`);
        }

        if (!isCardTrump(card, hand.trumpSuit)) {
            throw new InvalidPlayError(`Player ${playerId} can't play ${card.suit} ${card.value} because the trump suit is ${hand.trumpSuit}`);
        }

        player.hand.removeCard(card);
        hand.trick.cardsPlayed[playerId] = card;
    }

    hand.trick.playerTurn = getNextPlayerId(playerId, gameState.players) as PlayerId;
    autoAdvanceOutOfTrump(hand, gameState.players);

    if (isTrickOver(hand.trick)) {
        const winnerId = calcTrickWinner(hand);
        tallyTrickPoints(hand, winnerId, gameState.players);
        advanceTrick(hand, winnerId);
        // Auto-pass any out-of-trump players at the start of the new trick
        // (handles the case where the trick winner themselves has no trump left)
        autoAdvanceOutOfTrump(hand, gameState.players);
    }

    if (isHandOver(gameState)) {
        tallyHandPoints(gameState, hand);
        if (isGameOver(gameState, hand)) {
            gameState.handCycle = completeHand(hand);
        } else {
            resetForNextHand(gameState, hand);
        }
    }
}

function isPlayerOutOfTrump(player: Player, trumpSuit: Suit): boolean {
    return !player.hand.hasSuit(trumpSuit);
}

function getNextPlayerId(currentId: PlayerId, players: Player[]): string {
    const idx = players.findIndex(p => p.id === currentId);
    return players[(idx + 1) % players.length].id;
}

function isTrickOver(trick: Trick): boolean {
    return Object.keys(trick.cardsPlayed).length === 4;
}

function calcTrickWinner(hand: PlayingHand): PlayerId {
    const { cardsPlayed, startingPlayerId } = hand.trick;
    let winnerId = startingPlayerId;
    for (const [playerId, card] of Object.entries(cardsPlayed)) {
        if (card && beats(card, cardsPlayed[winnerId as PlayerId] ?? null, hand.trumpSuit)) {
            winnerId = playerId as PlayerId;
        }
    }
    return winnerId;
}

// Returns true if cardA beats cardB. cardB may be null (player passed).
function beats(cardA: Card, cardB: Card | null, trumpSuit: Suit): boolean {
    if (!cardB) return true;
    if (cardA.value === Value.ACE) return true;
    if (cardB.value === Value.ACE) return false;
    if (cardA.value === Value.JOKER) return cardB.value <= Value.JOKER;
    if (cardA.equals(Card.jick(trumpSuit))) return cardB.value < Value.JACK;
    if (cardB.equals(Card.jick(trumpSuit))) return cardA.value >= Value.JACK;
    if (cardA.suit === trumpSuit && cardB.suit === trumpSuit) return cardA.value >= cardB.value;
    return false;
}

function tallyTrickPoints(hand: PlayingHand, winnerId: PlayerId, players: Player[]): void {
    const winnerIndex = players.findIndex(p => p.id === winnerId);
    const points = Object.values(hand.trick.cardsPlayed)
        .reduce((sum, card) => sum + (card ? (CARD_POINTS[card.value] ?? 0) : 0), 0);

    if (winnerIndex % 2 === 0) {
        hand.teamOneHandPoints += points;
    } else {
        hand.teamTwoHandPoints += points;
    }
    assert(hand.teamOneHandPoints <= 10 && hand.teamTwoHandPoints <= 10, 'Hand points exceeded maximum');
}

function advanceTrick(hand: PlayingHand, winnerId: PlayerId): void {
    hand.trick = new Trick(
        hand.trick.roundNumber + 1,
        winnerId,
        {} as Record<PlayerId, Card | null>,
        winnerId,
    );
}

function autoAdvanceOutOfTrump(hand: PlayingHand, players: Player[]): void {
    while (!isTrickOver(hand.trick)) {
        const current = players.find(p => p.id === hand.trick.playerTurn);
        if (!current || !isPlayerOutOfTrump(current, hand.trumpSuit)) break;
        hand.trick.cardsPlayed[hand.trick.playerTurn] = null;
        hand.trick.playerTurn = getNextPlayerId(hand.trick.playerTurn, players) as PlayerId;
    }
}

function isHandOver(gameState: GameState): boolean {
    const hand = gameState.handCycle as PlayingHand;
    return gameState.players.every(p => isPlayerOutOfTrump(p, hand.trumpSuit));
}

function isGameOver(gameState: GameState, hand: PlayingHand): boolean {
    const bidWinnerIndex = gameState.players.findIndex(p => p.id === hand.bidWinnerId);
    const biddingTeamIsOne = bidWinnerIndex % 2 === 0;

    if (biddingTeamIsOne) {
        return hand.teamOneHandPoints >= hand.bidAmount &&
               gameState.teamOneScore >= GAME_WIN_THRESHOLD;
    } else {
        return hand.teamTwoHandPoints >= hand.bidAmount &&
               gameState.teamTwoScore >= GAME_WIN_THRESHOLD;
    }
}

function isCardTrump(card: Card, trumpSuit: Suit): boolean {
    return (card.suit == trumpSuit || card.value == Value.JOKER || Card.jick(trumpSuit).equals(card));
}

function tallyHandPoints(gameState: GameState, hand: PlayingHand): void {
    const bidWinnerIndex = gameState.players.findIndex(p => p.id === hand.bidWinnerId);
    if (bidWinnerIndex % 2 === 0) {
        gameState.teamOneScore += hand.teamOneHandPoints >= hand.bidAmount
            ? hand.teamOneHandPoints
            : -hand.bidAmount;
        gameState.teamTwoScore += hand.teamTwoHandPoints;
    } else {
        gameState.teamTwoScore += hand.teamTwoHandPoints >= hand.bidAmount
            ? hand.teamTwoHandPoints
            : -hand.bidAmount;
        gameState.teamOneScore += hand.teamOneHandPoints;
    }
}

function resetForNextHand(gameState: GameState, currentHand: PlayingHand): void {
    const nextDealerIndex = (gameState.players.findIndex(p => p.id === currentHand.dealerId) + 1) % gameState.players.length;
    const nextDealerId = gameState.players[nextDealerIndex].id;

    // Deal fresh cards for the new hand
    const deck = Card.createFullDeck();
    gameState.players.forEach(p => {
        p.hand = new Hand([]);
        for (let i = 0; i < CARDS_PER_PLAYER; i++) {
            p.hand.cards.push(deck.pop() as Card);
        }
    });

    const newHand = startBidding(createWaitingHand(nextDealerId), gameState.players);
    newHand.blindCards = deck;
    gameState.handCycle = newHand;
}
