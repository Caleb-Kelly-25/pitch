export interface TrickResult {
    playedCards: { playerId: string; card: CardModel | null }[];
    winnerId: string;
}

export interface HandResult {
    teamOneCardsWon: CardModel[];
    teamTwoCardsWon: CardModel[];
    bidWinnerId: string;
    bidAmount: number;
}

export interface GameState {
    gameId: string;
    phase: "WAITING" | "BIDDING" | "TRUMP_SELECTION" | "BLIND_CARDS" | "PLAYING" | "COMPLETE";
    players: Player[];
    hand: CardModel[];

    trick: {
        leadPlayerId: string;
        playerTurn: string;
        playedCards:{playerId:string, card: CardModel | undefined}[];
    }

    trickResult: TrickResult | null;
    handResult: HandResult | null;
    pendingGameState: any | null;

    bidding: {
        currentBidderId: string;
        highestBidderId: string;
        bids: (number | undefined)[];
    }

    trickNumber: number;
    leadSuit: "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES" | null;
    ourScore: number;
    theirScore: number;
    bidWinnerId: string;
    trumpSuit: "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES" | null;
    currentBlindCard: CardModel | null;
    blindCardRecipientId: string;
    teamOneCardsWon: CardModel[];
    teamTwoCardsWon: CardModel[];
    bidAmount: number;
    lastCompletedTrick: { playerId: string; card: CardModel | null }[] | null;
    lastHandResult: HandResult | null;
}

export interface Player {
    id: string;
    username: string;
    seat: 1 | 2 | 3 | 4;
    team: 0 | 1;
    isDealer: boolean;
    isConnected: boolean;
    cardCount: number;
}


type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";
type Value = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 1=A, 2-10, 11=Joker, 12=J, 13=Q, 14=K
export interface CardModel {
    suit: Suit;
    value: Value;
}

export interface Trick {
    leadPlayerId: string;
    playedCards: [
        {playerId: string, card: CardModel}
    ]
}