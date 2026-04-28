import { PlayerId } from "../../types/id-declarations";
import GameState, { LastHandResult } from "../../domain/entities/GameState";
import { HandCycle } from "../../domain/entities/HandCycle";
import { Suit } from "../../domain/enums/Suit";
import { Trick } from "../../domain/entities/Trick";
import { Card } from "../../domain/entities/Card";

type PhaseLabel = "WAITING" | "BIDDING" | "TRUMP_SELECTION" | "BLIND_CARDS" | "PLAYING" | "COMPLETE";
type ModelSuit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";

export interface CardModel {
    suit: ModelSuit;
    value: number;
}

export interface PlayerDTO {
    id: string;
    username: string;
    seat: 1 | 2 | 3 | 4;
    team: 0 | 1;
    isDealer: boolean;
    isConnected: boolean;
    cardCount: number;
}

export interface TrickDTO {
    leadPlayerId: string;
    playerTurn: string;
    playedCards: { playerId: string; card: CardModel }[];
}

export class PlayerViewResponseDTO {
    gameId: string = "";
    phase: PhaseLabel = "WAITING";
    players: PlayerDTO[] = [];
    hand: CardModel[] = [];
    trick: TrickDTO | null = null;
    bidding: { currentBidderId: string; highestBidderId: string; bids: (number|undefined)[] } = {
        currentBidderId: "",
        highestBidderId: "",
        bids: [],
    };
    trickNumber: number = 0;
    leadSuit: ModelSuit | null = null;
    scores: number[] = [];
    bidWinnerId: string = "";
    trumpSuit: ModelSuit | null = null;
    currentBlindCard: CardModel | null = null;
    blindCardRecipientId: string = "";
    teamOneCardsWon: CardModel[] = [];
    teamTwoCardsWon: CardModel[] = [];
    bidAmount: number = 0;
    lastCompletedTrick: { playerId: string; card: CardModel | null }[] | null = null;
    lastHandResult: { teamOneCardsWon: CardModel[]; teamTwoCardsWon: CardModel[]; bidWinnerId: string; bidAmount: number } | null = null;

    constructor() {}

    setGameId(gameId: string) { this.gameId = gameId; return this; }
    setPhase(phase: PhaseLabel) { this.phase = phase; return this; }
    setPlayers(players: PlayerDTO[]) { this.players = players; return this; }
    setHand(hand: CardModel[]) { this.hand = hand; return this; }
    setTrick(trick: TrickDTO | null) { this.trick = trick; return this; }
    setBidding(bidding: { currentBidderId: string; highestBidderId: string; bids: (number|undefined)[] }) { this.bidding = bidding; return this; }
    setTrickNumber(n: number) { this.trickNumber = n; return this; }
    setLeadSuit(suit: ModelSuit | null) { this.leadSuit = suit; return this; }
    setScores(scores: number[]) { this.scores = scores; return this; }
    setBidWinnerId(id: string) { this.bidWinnerId = id; return this; }
    setTrumpSuit(suit: ModelSuit | null) { this.trumpSuit = suit; return this; }
    setCurrentBlindCard(card: CardModel | null) { this.currentBlindCard = card; return this; }
    setBlindCardRecipientId(id: string) { this.blindCardRecipientId = id; return this; }
    setTeamOneCardsWon(cards: CardModel[]) { this.teamOneCardsWon = cards; return this; }
    setTeamTwoCardsWon(cards: CardModel[]) { this.teamTwoCardsWon = cards; return this; }
    setBidAmount(n: number) { this.bidAmount = n; return this; }
    setLastCompletedTrick(t: { playerId: string; card: CardModel | null }[] | null) { this.lastCompletedTrick = t; return this; }
    setLastHandResult(r: LastHandResult | null) {
        this.lastHandResult = r ? {
            teamOneCardsWon: r.teamOneCardsWon.map(dtoFromCard),
            teamTwoCardsWon: r.teamTwoCardsWon.map(dtoFromCard),
            bidWinnerId: r.bidWinnerId,
            bidAmount: r.bidAmount,
        } : null;
        return this;
    }

    static fromGameState(gameState: GameState, playerId: PlayerId): PlayerViewResponseDTO {
        const dto = new PlayerViewResponseDTO();
        const hand = gameState.handCycle;

        const viewingPlayer = gameState.players.find(p => p.id === playerId);
        const playerCards = (viewingPlayer?.hand.cards ?? []).map(dtoFromCard);

        dto.setGameId(gameState.id)
            .setPhase(phaseLabel(hand.phase))
            .setPlayers(gameState.players.map((p, i) => ({
                id: p.id,
                username: p.username,
                seat: ((i + 1) as 1 | 2 | 3 | 4),
                team: ((i % 2) as 0 | 1),
                isDealer: p.isDealer,
                isConnected: p.isConnected,
                cardCount: p.hand.cards.length,
            })))
            .setHand(playerCards)
            .setScores([gameState.teamOneScore, gameState.teamTwoScore]);

        switch (hand.phase) {
            case 'bidding':
                dto.setBidding({
                    currentBidderId: hand.biddingCycle.currentBidderId,
                    highestBidderId: hand.biddingCycle.highestBidderId ?? '',
                    bids: gameState.players.map(p => hand.biddingCycle.playerBids[p.id] ?? undefined),
                }).setLastHandResult(gameState.lastHandResult);
                break;

            case 'trumpselection':
                dto.setBidWinnerId(hand.bidWinnerId);
                break;

            case 'blindcards':
                dto.setBidWinnerId(hand.bidWinnerId)
                    .setTrumpSuit(domainSuitToModel(hand.trumpSuit))
                    .setBlindCardRecipientId(hand.currentRecipientId)
                    .setCurrentBlindCard(
                        viewingPlayer?.id === hand.currentRecipientId && hand.currentBlindCard
                            ? dtoFromCard(hand.currentBlindCard)
                            : null
                    );
                break;

            case 'playing':
                dto.setTrick(dtoFromTrick(hand.trick))
                    .setTrickNumber(hand.trick.roundNumber)
                    .setLeadSuit(domainSuitToModel(hand.trumpSuit))
                    .setTeamOneCardsWon(hand.teamOneCardsWon.map(dtoFromCard))
                    .setTeamTwoCardsWon(hand.teamTwoCardsWon.map(dtoFromCard))
                    .setBidAmount(hand.bidAmount)
                    .setBidWinnerId(hand.bidWinnerId)
                    .setLastCompletedTrick(lastCompletedTrickDto(hand.lastCompletedTrick));
                break;

            case 'complete':
                dto.setBidWinnerId(hand.bidWinnerId)
                    .setLastHandResult(gameState.lastHandResult);
                break;

            case 'waiting':
                break;
        }

        return dto;
    }
}

function phaseLabel(phase: HandCycle['phase']): PhaseLabel {
    const map: Record<HandCycle['phase'], PhaseLabel> = {
        'waiting': 'WAITING',
        'bidding': 'BIDDING',
        'trumpselection': 'TRUMP_SELECTION',
        'blindcards': 'BLIND_CARDS',
        'playing': 'PLAYING',
        'complete': 'COMPLETE',
    };
    return map[phase];
}

function domainSuitToModel(suit: Suit): ModelSuit | null {
    const map: Record<Suit, ModelSuit> = {
        [Suit.HEARTS]: "HEARTS",
        [Suit.DIAMONDS]: "DIAMONDS",
        [Suit.CLUBS]: "CLUBS",
        [Suit.SPADES]: "SPADES",
    };
    return map[suit] ?? null;
}

function dtoFromCard(card: Card): CardModel {
    return { suit: domainSuitToModel(card.suit) as ModelSuit, value: Number(card.value) };
}

function lastCompletedTrickDto(
    cardsPlayed: Record<string, Card | null> | null
): { playerId: string; card: CardModel | null }[] | null {
    if (!cardsPlayed) return null;
    return Object.entries(cardsPlayed).map(([pid, card]) => ({
        playerId: pid,
        card: card ? dtoFromCard(card) : null,
    }));
}

function dtoFromTrick(trick: Trick): TrickDTO {
    const playedCards = Object.entries(trick.cardsPlayed)
        .filter((entry): entry is [string, Card] => entry[1] !== null)
        .map(([pid, card]) => ({ playerId: pid, card: dtoFromCard(card) }));

    return { leadPlayerId: trick.startingPlayerId, playerTurn: trick.playerTurn, playedCards };
}
