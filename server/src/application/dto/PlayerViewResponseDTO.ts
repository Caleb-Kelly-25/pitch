import { PlayerId } from "../../types/id-declarations";
import GameState from "../../domain/entities/GameState";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";
import { Trick } from "../../domain/entities/Trick";
import { Card } from "../../domain/entities/Card";

export class PlayerViewResponseDTO {
    gameId: string = "";
    phase: "BIDDING" | "PLAYING"| "WAITING" | "COMPLETE" = "WAITING";
    players: PlayerDTO[] = [];
    hand: CardModel[] = [];

    trick: TrickDTO | null = {} as TrickDTO;

    bidding: {
        currentBidderId: string;
        highestBidderId: string;
        bids: (number)[]
    } = {currentBidderId:"", highestBidderId:"", bids:[]};

    trickNumber: number = 0;
    leadSuit: "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES" | null = null;
    scores: number[] = []

    constructor(){}

    setGameId(gameId: string) {
        this.gameId = gameId;
        return this;
    }

    setPhase(phase: "BIDDING" | "PLAYING"| "WAITING" | "COMPLETE") {
        this.phase = phase;
        return this;
    }

    setPlayers(players: PlayerDTO[]) {
        this.players = players;
        return this;
    }

    setHand(hand: CardModel[]) {
        this.hand = hand;
        return this;
    }

    setTrick(trick: TrickDTO) {
        this.trick = trick;
        return this;
    }

    setBidding(bidding: {currentBidderId: string; highestBidderId: string; bids: (number)[]}) {
        this.bidding = bidding;
        return this;
    }

    setTrickNumber(trickNumber: number) {
        this.trickNumber = trickNumber;
        return this;
    }

    setLeadSuit(leadSuit: "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES" | null) {
        this.leadSuit = leadSuit;
        return this;
    }

    setScores(scores: number[]) {
        this.scores = scores;
        return this;
    }

    static fromGameState(gameState: GameState, playerId: PlayerId) {
        const dto = new PlayerViewResponseDTO();
        const playerCards = (gameState.players.find(p => p.id === playerId)?.hand.cards || []).map(c => (dtoFromCard(c)));
        
        dto.setGameId(gameState.id)
            .setPhase(gameState.handCycle.handCycleStatus)
            .setPlayers(gameState.players.map(p => ({
                id: p.id,
                username: p.username,
                seat: gameState.players.findIndex(p => p.id === playerId) + 1,
                team: gameState.players.findIndex(p => p.id === playerId) % 2,
                isDealer: p.isDealer,
                isConnected: p.isConnected,
                cardCount: p.hand.cards.length
            } as PlayerDTO)))
            .setHand(playerCards)
            .setTrick(dtoFromTrick(gameState.handCycle?.trick))
            .setBidding({
                currentBidderId: gameState.handCycle.trick?.playerTurn || "",
                highestBidderId: gameState.players.find(p => p.currentBid==gameState.handCycle.bidAmount)?.id || "",
                bids: gameState.players.map(p => p.currentBid ? p.currentBid : 0)
              })
            .setTrickNumber(gameState.handCycle.trick?.roundNumber || 0)
            .setLeadSuit(modelSuitFromDomainSuit(gameState.handCycle.trumpSuit))
            .setScores([gameState.teamOneScore, gameState.teamTwoScore]);

        return dto;
    }
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


function modelSuitFromDomainSuit(suit: string): ModelSuit | null {
    switch (suit) {
        case Suit.HEARTS:
            return "HEARTS";
        case Suit.DIAMONDS:
            return "DIAMONDS";
        case Suit.CLUBS:
            return "CLUBS";
        case Suit.SPADES:
            return "SPADES";
        default:
            return null;
    }
}

function modelValueFromDomainValue(value: Value): number {
    // 1. Handle Numeric Enums or direct numbers
    const numValue = Number(value);
    
    return numValue;
}

function dtoFromTrick(trick: Trick | null): TrickDTO {
    if (!trick) {
        return {
            leadPlayerId: "",
            playedCards: []
        };
    }
    const plays: {playerId: string, card: CardModel}[] = [];
    
    // Ensure we are working with entries, whether it's a Map or Object
    const entries = Object.entries(trick.cardsPlayed);

    for (const [playerId, card] of entries) {
        plays.push({
            playerId,
            card: dtoFromCard(card as Card) // Reusing your helper function
        });
    }
    
    return {
        leadPlayerId: trick.startingPlayerId,
        playedCards: plays
    };
}

function dtoFromCard(card: Card): CardModel {
    return {suit: modelSuitFromDomainSuit(card.suit), value: modelValueFromDomainValue(card.value)} as CardModel;
}

type ModelSuit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";
export interface CardModel {
    suit: ModelSuit;
    value: number;
}

export interface TrickDTO {
    leadPlayerId: string;
    playedCards:{playerId: string, card: CardModel}[];
    
}