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

    trick: TrickDTO = {} as TrickDTO;

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
            .setTrick(dtoFromTrick(gameState.handCycle.trick))
            .setBidding({
        currentBidderId: gameState.handCycle.trick.playerTurn,
        highestBidderId: gameState.players.find(p => p.currentBid==gameState.handCycle.bidAmount)?.id || "",
        bids: gameState.players.map(p => p.currentBid ? p.currentBid : 0)
    })
            .setTrickNumber(gameState.handCycle.trick.roundNumber)
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

function modelValueFromDomainValue(value: Value): ModelValue {
    if (value >= 2 && value <= Value.TEN) {
        return value.toString() as ModelValue;
    } else {
        switch(value){
            case Value.JACK:
                return "J";
            case Value.QUEEN:
                return "Q";
            case Value.KING:
                return "K";
            case Value.ACE:
                return "A";
            default:
                throw new Error(`Invalid value: ${value}`);
        }
    }
}

function dtoFromTrick(trick: Trick): TrickDTO {
        const plays: {playerId: string, card: CardModel}[] = [];
        for (const [playerId, card] of trick.cardsPlayed.entries()) {
            plays.push({
                playerId,
                card: {
                    suit: modelSuitFromDomainSuit(card?.suit || ""),
                    value: modelValueFromDomainValue(card?.value || Value.ACE)
                } as CardModel
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
type ModelValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export interface CardModel {
    suit: ModelSuit;
    value: ModelValue;
}

export interface TrickDTO {
    leadPlayerId: string;
    playedCards:{playerId: string, card: CardModel}[];
    
}