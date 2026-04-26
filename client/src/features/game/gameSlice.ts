import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import type { GameState, TrickResult, HandResult } from "./gameTypes"

const initialState: GameState = {
  gameId: "initialId",
  phase: "WAITING",
  players: [
    { id: "playerId1", username: "Player1", seat: 1, team: 0, isDealer: true,  isConnected: true, cardCount: 6 },
    { id: "playerId2", username: "Player2", seat: 2, team: 1, isDealer: false, isConnected: true, cardCount: 6 },
    { id: "playerId3", username: "Player3", seat: 3, team: 0, isDealer: false, isConnected: true, cardCount: 6 },
    { id: "playerId4", username: "Player4", seat: 4, team: 1, isDealer: false, isConnected: true, cardCount: 6 },
  ],
  hand: [
    { suit: "HEARTS",   value: 1  },
    { suit: "SPADES",   value: 14 },
    { suit: "DIAMONDS", value: 11 },
    { suit: "CLUBS",    value: 10 },
    { suit: "HEARTS",   value: 13 },
    { suit: "SPADES",   value: 12 },
  ],
  trick: {
    leadPlayerId: "playerId1",
    playerTurn: "playerId1",
    playedCards: [
      { playerId: "playerId1", card: undefined },
      { playerId: "playerId2", card: undefined },
      { playerId: "playerId3", card: undefined },
      { playerId: "playerId4", card: undefined },
    ],
  },
  trickResult: null,
  handResult: null,
  pendingGameState: null,
  bidding: {
    currentBidderId: "playerId1",
    highestBidderId: "playerId1",
    bids: [4, 5, 0, 6],
  },
  trickNumber: 0,
  leadSuit: "HEARTS",
  ourScore: 0,
  theirScore: 1,
  bidWinnerId: "",
  trumpSuit: null,
  currentBlindCard: null,
  blindCardRecipientId: "",
  teamOneCardsWon: [],
  teamTwoCardsWon: [],
  bidAmount: 0,
  lastCompletedTrick: null,
  lastHandResult: null,
}

function dtoToGameState(dto: any) {
  return {
    ...dto,
    ourScore: dto.scores[0],
    theirScore: dto.scores[1],
    trick: dto.trick ?? { leadPlayerId: "", playerTurn: "", playedCards: [] },
    bidding: {
      ...dto.bidding,
      bids: dto.bidding?.bids?.map((b: any) => b ?? undefined) ?? [],
    },
    bidWinnerId: dto.bidWinnerId ?? "",
    trumpSuit: dto.trumpSuit ?? null,
    currentBlindCard: dto.currentBlindCard ?? null,
    blindCardRecipientId: dto.blindCardRecipientId ?? "",
    teamOneCardsWon: dto.teamOneCardsWon ?? [],
    teamTwoCardsWon: dto.teamTwoCardsWon ?? [],
    bidAmount: dto.bidAmount ?? 0,
    lastCompletedTrick: dto.lastCompletedTrick ?? null,
    lastHandResult: dto.lastHandResult ?? null,
    trickResult: null,
    handResult: null,
    pendingGameState: null,
  };
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState(_state, action: PayloadAction<any>) {
      const dto = action.payload;
      console.log(dto);
      return dtoToGameState(dto);
    },
    setTrickResult(state, action: PayloadAction<TrickResult>) {
      state.trickResult = action.payload;
    },
    setHandResult(state, action: PayloadAction<HandResult>) {
      state.handResult = action.payload;
      state.trickResult = null;
    },
    setPendingGameState(state, action: PayloadAction<any>) {
      state.pendingGameState = action.payload;
    },
    confirmOverlay(state) {
      const pending = state.pendingGameState;
      if (pending) {
        return { ...dtoToGameState(pending), trickResult: null, handResult: null, pendingGameState: null };
      }
      state.trickResult = null;
      state.handResult = null;
      state.pendingGameState = null;
    },
  },
})

export const selectGame = (state: RootState) => state.game

export default gameSlice.reducer
