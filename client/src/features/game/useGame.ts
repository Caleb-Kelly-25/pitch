import { /*useAppDispatch, */useAppSelector } from "../../application/hooks"

export function useGame() {
  const game = useAppSelector(s => s.game)

  return { game }
}