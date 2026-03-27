import {createSlice} from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../application/store"
import type { GameState, Player} from "./gameTypes";

const initialState: GameState = {
    gameId: "initialId",
    phase: "WAITING",

    players: [
        { id: "playerId1", username: "Player1", seat: 1 as const, team: 0 as const, isDealer: true,  isConnected: true, cardCount: 6 },
        { id: "playerId2", username: "Player2", seat: 2 as const, team: 1 as const, isDealer: false, isConnected: true, cardCount: 6 },
        { id: "playerId3", username: "Player3", seat: 3 as const, team: 0 as const, isDealer: false, isConnected: true, cardCount: 6 },
        { id: "playerId4", username: "Player4", seat: 4 as const, team: 1 as const, isDealer: false, isConnected: true, cardCount: 6 },
    ],

    hand: [{
        suit: "HEARTS",
        value: 1
    }],
    trick: {
            leadPlayerId: "playerId1",
            playedCards: [
                {playerId: "playerId1", card: {suit: "HEARTS", value: 1}},
                {playerId: "playerId2", card: {suit: "DIAMONDS", value: 12}},
                {playerId: "playerId3", card: undefined},
                {playerId: "playerId4", card: undefined},
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