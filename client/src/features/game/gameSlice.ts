import {createSlice} from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../application/store"
import type { GameState, Player, CardModel } from "./gameTypes";

const initialState: GameState = {
    gameId: "initialId",
    phase: "WAITING",

    players: ["playerId1", "playerId2", "playerId3", "playerId4"].map((id, index) => ({
        id: id,
        username: `Player${index + 1}`,
        seat: (index + 1) as 1 | 2 | 3 | 4,
        team: index < 2 ? 0 : 1,
        isDealer: index === 0,
        isConnected: true,
        cardCount: 0
    } as Player)),

    hand: [],
    trick: {
            leadPlayerId: "playerId1",
            playedCards: [
                {playerId: "playerId1", card: {suit: "hearts", value: "A"}},
            ]
        },
    
        bidding: {
            currentBidderId: "playerId2",
            highestBidderId: "playerId1",
            bids: [5, undefined, undefined, undefined]
        },
    
        trickNumber: 0,
        leadSuit: "HEARTS",
        ourScore: 0,
        theirScore: 1
}

export const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameState(state: GameState, action: PayloadAction<GameState>) {
            state;
            return action.payload;
        },
    }
})

export const { setGameState } = gameSlice.actions

export const selectGame = (state: RootState) => state.game

export default gameSlice.reducer