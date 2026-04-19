import type { RootState } from "../../app/store"
import type { AuthState } from "./authTypes"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as authApi from "./authApi"

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    return authApi.login(username, password)
  }
)

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ username, password }: { username: string; password: string }) => {
    return authApi.signup(username, password)
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Login failed"
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Signup failed"
      })
  },
})

export const { logout } = authSlice.actions

export const selectAuth = (state: RootState) => state.auth

export default authSlice.reducer
