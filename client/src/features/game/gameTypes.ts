export interface GameState {
    id: string | null
    players: string[]
    hand: string[]
    currentPlayer: string | null
}