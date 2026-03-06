import {createSlice} from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../application/store"
import type { GameState } from "./gameTypes";

const initialState: GameState = {
    id: null,
    players: [],
    hand: [],
    currentPlayer: null
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