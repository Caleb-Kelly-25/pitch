import { Suit } from "../enums/Suit";
import { Value } from "../enums/Value";
import { Card } from "./Card";
import { Player } from "./Player";
import { PlayerId } from "../../types/id-declarations";
import { BiddingCycle } from "./BiddingCycle";
import { Trick } from "./Trick";

// Discriminated union — each phase carries exactly the data it needs.
// No optional fields, no null assertions required by callers.

export interface WaitingHand {
    phase: 'waiting';
    dealerId: PlayerId;
}

export interface BiddingHand {
    phase: 'bidding';
    dealerId: PlayerId;
    blindCards: Card[];
    biddingCycle: BiddingCycle;
}

export interface TrumpSelectHand {
    phase: 'trumpselection';
    dealerId: PlayerId;
    bidWinnerId: PlayerId;
    bidAmount: number;
    blindCards: Card[];
}

export interface BlindCardsHand {
    phase: 'blindcards';
    dealerId: PlayerId;
    bidWinnerId: PlayerId;
    currentRecipientId: PlayerId;
    bidAmount: number;
    trumpSuit: Suit;
    blindCards: Card[];
    currentBlindCard: Card | null;
    discardedCards: Card[];
}

export interface PlayingHand {
    phase: 'playing';
    dealerId: PlayerId;
    bidWinnerId: PlayerId;
    bidAmount: number;
    trumpSuit: Suit;
    trick: Trick;
    teamOneHandPoints: number;
    teamTwoHandPoints: number;
    teamOneCardsWon: Card[];
    teamTwoCardsWon: Card[];
    lastCompletedTrick: Record<PlayerId, Card | null> | null;
}

export interface CompleteHand {
    phase: 'complete';
    dealerId: PlayerId;
    bidWinnerId: PlayerId;
    bidAmount: number;
    trumpSuit: Suit;
    teamOneHandPoints: number;
    teamTwoHandPoints: number;
}

export type HandCycle = WaitingHand | BiddingHand | TrumpSelectHand | BlindCardsHand | PlayingHand | CompleteHand;

// --- Factory / transition functions ---

export function createWaitingHand(dealerId: PlayerId): WaitingHand {
    return { phase: 'waiting', dealerId };
}

export function startBidding(hand: WaitingHand, players: Player[]): BiddingHand {
    const dealerIndex = players.findIndex(p => p.id === hand.dealerId);
    const biddingOrder = [
        ...players.slice(dealerIndex + 1),
        ...players.slice(0, dealerIndex + 1),
    ];

    const playerBids: Record<PlayerId, number | undefined> = {} as Record<PlayerId, number | undefined>;
    biddingOrder.forEach(p => { playerBids[p.id] = undefined; });

    return {
        phase: 'bidding',
        dealerId: hand.dealerId,
        blindCards: [],
        biddingCycle: new BiddingCycle(biddingOrder[0].id, null, 0, playerBids),
    };
}

export function startTrumpSelection(hand: BiddingHand): TrumpSelectHand {
    const { highestBidderId, highestBid } = hand.biddingCycle;
    if (!highestBidderId) throw new Error('Bidding ended with no winner');

    return {
        phase: 'trumpselection',
        dealerId: hand.dealerId,
        bidWinnerId: highestBidderId,
        bidAmount: highestBid,
        blindCards: hand.blindCards,
    };
}

export function startBlindCards(hand: TrumpSelectHand, trumpSuit: Suit, players: Player[]): BlindCardsHand {
    const jick = Card.jick(trumpSuit);

    // Strip non-trump/non-joker/non-jick cards from every player
    for (const player of players) {
        player.hand.cards = player.hand.cards.filter(c =>
            c.suit === trumpSuit ||
            c.value === Value.JOKER ||
            c.equals(jick)
        );
    }

    // Auto-deal blind cards to non-bid-winner players until they have 6
    const blindDeck = [...hand.blindCards];
    for (const player of players) {
        if (player.id === hand.bidWinnerId) continue;
        while (player.hand.cards.length < 6 && blindDeck.length > 0) {
            player.hand.cards.push(blindDeck.pop() as Card);
        }
    }

    // Prepare the first blind card for the bid winner (if any remain and they have room)
    const bidWinner = players.find(p => p.id === hand.bidWinnerId)!;
    let currentBlindCard: Card | null = null;
    if (blindDeck.length > 0 && bidWinner.hand.cards.length < 6) {
        currentBlindCard = blindDeck.pop() as Card;
    }

    return {
        phase: 'blindcards',
        dealerId: hand.dealerId,
        bidWinnerId: hand.bidWinnerId,
        currentRecipientId: hand.bidWinnerId,
        bidAmount: hand.bidAmount,
        trumpSuit,
        blindCards: blindDeck,
        currentBlindCard,
        discardedCards: [],
    };
}

export function startPlayingFromBlindCards(hand: BlindCardsHand): PlayingHand {
    return {
        phase: 'playing',
        dealerId: hand.dealerId,
        bidWinnerId: hand.bidWinnerId,
        bidAmount: hand.bidAmount,
        trumpSuit: hand.trumpSuit,
        trick: new Trick(0, hand.bidWinnerId, {} as Record<PlayerId, Card | null>, hand.bidWinnerId),
        teamOneHandPoints: 0,
        teamTwoHandPoints: 0,
        teamOneCardsWon: [],
        teamTwoCardsWon: [],
        lastCompletedTrick: null,
    };
}

export function completeHand(hand: PlayingHand): CompleteHand {
    return {
        phase: 'complete',
        dealerId: hand.dealerId,
        bidWinnerId: hand.bidWinnerId,
        bidAmount: hand.bidAmount,
        trumpSuit: hand.trumpSuit,
        teamOneHandPoints: hand.teamOneHandPoints,
        teamTwoHandPoints: hand.teamTwoHandPoints,
    };
}



export function handCycleFromJSON(data: any): HandCycle {
    switch (data.phase) {
        case 'waiting':
            return { phase: 'waiting', dealerId: data.dealerId };

        case 'bidding':
            return {
                phase: 'bidding',
                dealerId: data.dealerId,
                blindCards: (data.blindCards ?? []).map((c: any) => new Card(c.suit, c.value)),
                biddingCycle: BiddingCycle.fromJSONObject(data.biddingCycle),
            };

        case 'trumpselection':
            return {
                phase: 'trumpselection',
                dealerId: data.dealerId,
                bidWinnerId: data.bidWinnerId,
                bidAmount: data.bidAmount,
                blindCards: (data.blindCards ?? []).map((c: any) => new Card(c.suit, c.value)),
            };

        case 'blindcards':
            return {
                phase: 'blindcards',
                dealerId: data.dealerId,
                bidWinnerId: data.bidWinnerId,
                currentRecipientId: data.currentRecipientId ?? data.bidWinnerId,
                bidAmount: data.bidAmount,
                trumpSuit: data.trumpSuit,
                blindCards: (data.blindCards ?? []).map((c: any) => new Card(c.suit, c.value)),
                currentBlindCard: data.currentBlindCard
                    ? new Card(data.currentBlindCard.suit, data.currentBlindCard.value)
                    : null,
                discardedCards: (data.discardedCards ?? []).map((c: any) => new Card(c.suit, c.value)),
            };

        case 'playing':
            return {
                phase: 'playing',
                dealerId: data.dealerId,
                bidWinnerId: data.bidWinnerId,
                bidAmount: data.bidAmount,
                trumpSuit: data.trumpSuit,
                trick: Trick.fromJSONObject(data.trick),
                teamOneHandPoints: data.teamOneHandPoints,
                teamTwoHandPoints: data.teamTwoHandPoints,
                teamOneCardsWon: (data.teamOneCardsWon ?? []).map((c: any) => new Card(c.suit, c.value)),
                teamTwoCardsWon: (data.teamTwoCardsWon ?? []).map((c: any) => new Card(c.suit, c.value)),
                lastCompletedTrick: data.lastCompletedTrick
                    ? Object.fromEntries(
                        Object.entries(data.lastCompletedTrick).map(([pid, c]: [string, any]) =>
                            [pid, c ? new Card(c.suit, c.value) : null]
                        )
                    ) as Record<PlayerId, Card | null>
                    : null,
            };

        case 'complete':
            return {
                phase: 'complete',
                dealerId: data.dealerId,
                bidWinnerId: data.bidWinnerId,
                bidAmount: data.bidAmount,
                trumpSuit: data.trumpSuit,
                teamOneHandPoints: data.teamOneHandPoints,
                teamTwoHandPoints: data.teamTwoHandPoints,
            };

        default:
            throw new Error(`Unknown hand phase in stored data: '${data.phase}'`);
    }
}
