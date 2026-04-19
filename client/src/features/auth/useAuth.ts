import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { login, logout, signup } from "./authSlice"

export function useAuth() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  return {
    ...auth,
    login: (username: string, password: string) =>
      dispatch(login({ username, password })),
    signup: (username: string, password: string) =>
      dispatch(signup({ username, password })),
    logout: () => dispatch(logout()),
  }
}
