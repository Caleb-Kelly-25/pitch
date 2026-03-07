
export class ViewUpdate {
    // The seat of the player whose view we are updating. This is used to determine which cards to show in the view.
    SeatOfPlayer: number;
    // The number of cards in each seat. This is used to determine how many cards to show in the view for each seat.
    SeatOneNumberCards: number;
    SeatTwoNumberCards: number;
    SeatThreeNumberCards: number;
    SeatFourNumberCards: number;
    // The seat of the player whose turn it is. This is used to determine which player's turn it is in the view.
    WhoseTurn: number;
    // The winning Bid. 
    WinningBid: number;
    // The points that the player's team has. This is used to determine how many points to show in the view for the player's team.
    PointsUsHas: number;
    PointsThemHas: number;
    //Who has bid & how much did they bid
    SeatsAndTheirBids: { seat: number, bid: number }[];
    //Who has played which cards (maybe just show the cards that have been played in the view and not in the hand)
    SeatsAndTheirPlayedCards: { seat: number, cards: string[] }[];

    constructor(SeatOfPlayer: number, SeatOneNumberCards: number, SeatTwoNumberCards: number, SeatThreeNumberCards: number, SeatFourNumberCards: number, WhoseTurn: number, WinningBid: number, PointsUsHas: number, PointsThemHas: number, SeatsAndTheirBids: { seat: number, bid: number }[], SeatsAndTheirPlayedCards: { seat: number, cards: string[] }[]) {
        this.SeatOfPlayer = SeatOfPlayer;
        this.SeatOneNumberCards = SeatOneNumberCards;
        this.SeatTwoNumberCards = SeatTwoNumberCards;
        this.SeatThreeNumberCards = SeatThreeNumberCards;
        this.SeatFourNumberCards = SeatFourNumberCards;
        this.WhoseTurn = WhoseTurn;
        this.WinningBid = WinningBid;
        this.PointsUsHas = PointsUsHas;
        this.PointsThemHas = PointsThemHas;
        this.SeatsAndTheirBids = SeatsAndTheirBids;
        this.SeatsAndTheirPlayedCards = SeatsAndTheirPlayedCards;
    }
}