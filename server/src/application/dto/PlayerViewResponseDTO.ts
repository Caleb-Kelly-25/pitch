import { PlayerId } from "../../types/id-declarations";
import GameState from "../../domain/entities/GameState";
import { Suit } from "../../domain/enums/Suit";
import { Value } from "../../domain/enums/Value";

export class PlayerViewResponseDTO {
    gameId: string = "";
    phase: "BIDDING" | "PLAYING"| "WAITING" | "COMPLETE" = "WAITING";
    players: PlayerDTO[] = [];
    hand: CardModel[] = [];

    trick: TrickDTO = {} as TrickDTO;

    bidding: {
        currentBidderId: string;
        highestBidderId: string;
        bids: (number | "pass" | null)[]
    } = {currentBidderId:"", highestBidderId:"", bids:[]};

    trickNumber: number = 0;
    leadSuit: "hearts" | "diamonds" | "clubs" | "spades" | null = null;
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

    setBidding(bidding: {currentBidderId: string; highestBidderId: string; bids: (number | "pass" | null)[]}) {
        this.bidding = bidding;
        return this;
    }

    setTrickNumber(trickNumber: number) {
        this.trickNumber = trickNumber;
        return this;
    }

    setLeadSuit(leadSuit: "hearts" | "diamonds" | "clubs" | "spades" | null) {
        this.leadSuit = leadSuit;
        return this;
    }

    setScores(scores: number[]) {
        this.scores = scores;
        return this;
    }

    static fromGameState(gameState: GameState, playerId: PlayerId) {
        const dto = new PlayerViewResponseDTO();
        const playerCards = (gameState.players.find(p => p.id === playerId)?.hand.cards || []).map(c => ({suit: c.suit, value: c.value} as CardModel));
        dto.setGameId(gameState.id)
            .setPhase(gameState.handCycle.handCycleStatus)
            .setPlayers(gameState.players.map(p => ({
                id: p.id,
                username: p.name,
                seat: p.seat,
                team: p.team,
                isDealer: p.isDealer,
                isConnected: p.isConnected,
                cardCount: p.hand.cards.length
            } as PlayerDTO)))
            .setHand(playerCards)
            .setTrick(gameState.trick)
            .setBidding(gameState.bidding)
            .setTrickNumber(gameState.trickNumber)
            .setLeadSuit(gameState.handCycle.trumpSuit)
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


function modelSuitFromDomainSuit(suit: string): ModelSuit {
    switch (suit) {
        case Suit.HEARTS:
            return "hearts";
        case Suit.DIAMONDS:
            return "diamonds";
        case Suit.CLUBS:
            return "clubs";
        case Suit.SPADES:
            return "spades";
        default:
            throw new Error(`Invalid suit: ${suit}`);
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
        

type ModelSuit = "hearts" | "diamonds" | "clubs" | "spades";
type ModelValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export interface CardModel {
    suit: ModelSuit;
    value: ModelValue;
}

export interface TrickDTO {
    leadPlayerId: string;
    playedCards: [
        {playerId: string, card: CardModel}
    ]
}