export class UserProfile {
    constructor(
        public userId: string,
        public gamesCompleted: number = 0,
        public gamesWon: number = 0,
        public cardsPlayed: number = 0,
        public tricksPlayed: number = 0,
        public tricksWon: number = 0,
        public bidsPlayed: number = 0,
        public bidsWon: number = 0,
    ) {}
}
