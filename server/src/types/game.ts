

/* The Game interface represents the overall game state, including teams, scores, and game status */
export interface IGame {
    id: string;
    team1: ITeam;
    team2: ITeam;
    gameState: 'waiting' | 'playing' | 'ended';
    isGameOver: boolean;
    winningTeam?: 1 | 2 | null;
    team1Score: number; // Total points accumulated by Team 1 across all hand cycles
    team2Score: number; // Total points accumulated by Team 2 across all hand cycles
    endTime?: Date | null;
}

/* The HandCycle interface represents the current hand cycle in the game, which includes bidding */
export interface IHandCycle {
    id: string;
    gameID: string;
    dealerID: string | null;
    currentBidderID: string | null;
    currentBidAmount: number | null;
    BidWinnerID?: string | null;
    trumpSuit?: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades' | null;
    handCycleStatus: 'bidding' | 'playing' | 'ended';
    blindCards: ICard[] | null;
    team1Points: number; // Points accumulated by Team 1 in the current hand cycle aka all rounds played so far
    team2Points: number; // Points accumulated by Team 2 in the current hand cycle aka all rounds played so far
}

/* The RoundPhase interface represents the current round in the game, which includes card playing and determining the round winner */
export interface IRoundPhase {
    id: string;
    handCycleID: string;
    roundNumber: number;
    startingPlayerID: string | null;
    currentPlayerID: string | null;
    cardsPlayed: { 
        participantID: string; 
        card: ICard 
    }[];
    roundWinnerID?: string | null;
}

/* The Participant interface represents the player in the game */
export interface IParticipant {
    id: string;
    playerID: string;
    teamID: number;
    username: string;
    isConnected: boolean;
    handID: string | null;
    isBidder: boolean;
    isDealer: boolean;
    currentBid: number | null;
    seatNumber: 0 | 1 | 2 | 3;
}

/* The Team interface represents a team in the game which consists of 2 participants */
export interface ITeam {
    id: string;
    gameID: string;
    teamNumber: 1 | 2;
    totalScore: number;
    participants: IParticipant[];
}

/* The Card interface represents a single card in the game */
export interface ICard {
    id: string;
    suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
    value: 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
    points: 0 | 1 | 3;
    isPlayable: boolean;
    imagePath: string;
} 

/* The Hand interface represents the hand of cards a participant has */
export interface IHand {
    id: string;
    participantID: string;
    handCycleID: string;
    cards: ICard[];
} 


