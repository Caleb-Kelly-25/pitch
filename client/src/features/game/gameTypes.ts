export interface GameState {
    gameId: string;
    phase: "BIDDING" | "PLAYING"| "WAITING" | "COMPLETE";
    players: Player[];
    hand: CardModel[];

    trick: {
        leadPlayerId: string;
        playedCards: [
            {playerId:string, card: CardModel}
        ]
    }

    bidding: {
        currentBidderId: string;
        highestBidderId: string;
        bids: (number | "pass" | null)[]
    }

    trickNumber: number;
    leadSuit: "hearts" | "diamonds" | "clubs" | "spades" | null;
    scores: number[]
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


type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Value = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
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