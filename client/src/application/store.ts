import { configureStore } from "@reduxjs/toolkit"
import gameReducer from "../features/game/gameSlice.ts"
import authReducer from "../features/auth/authSlice.ts"

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch