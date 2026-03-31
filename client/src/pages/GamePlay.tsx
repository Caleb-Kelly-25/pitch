import HandOfCards from "../components/HandOfCards";
import Table from "../components/Table";
import TopBar from "../components/TopBar";
import PlayerSeat from "../components/PlayerSeat";
import { useGame } from "../features/game/useGame";
import type { CardProps } from "../components/Card";
import { playCard } from "../features/game/gameService";

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    backgroundColor: "#7d2a2a",
    position: "fixed" as const,
    top: 0,
    left: 0,
    overflow: "hidden",
  },
};

// This function is used to determine the current phase of the game call coresponding functions
export function determinePhase() {
  const gameState = useGame();
  if (gameState.phase === "WAITING") {
    return "Waiting for players to join...";
  }
  else if (gameState.phase === "BIDDING") {
    displayTable();
    displayScore();
    
    return "Bidding phase";
  } else if (gameState.phase === "PLAYING") {
    return "Playing phase";
  } else if (gameState.phase === "COMPLETE") {
    return "Complete phase";
  } else {
    return "Unknown phase";
  }
}

export function displayTable() {
  const gameState = useGame();
  return (
    <Table
        bottom = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[0].id)?.card}
        left = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[1].id)?.card}
        top = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[2].id)?.card}
        right = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[3].id)?.card}
      >
        <PlayerSeat position="top">
          <HandOfCards count={gameState.players[2].cardCount} />
        </PlayerSeat>

        <PlayerSeat position="left">
          <HandOfCards count={gameState.players[1].cardCount} />
          {console.log(gameState.players[1].cardCount)}
        </PlayerSeat>

        <PlayerSeat position="right">
          <HandOfCards count={gameState.players[3].cardCount} />
        </PlayerSeat>

        <PlayerSeat position="bottom">
          <HandOfCards count={gameState.hand.length} cards={gameState.hand.map((card) => ({ suit: card.suit, value: card.value, onClick: () => playCard(card.suit, card.value, gameState.gameId) } as CardProps))} />
        </PlayerSeat>
      </Table>
  )
}

export function displayScore() {
  //TODO: implement score display
  //Score for Us vs. Them
  //Score for this round and whole game
}

export default function GamePlay() {
  const gameState = useGame();
  console.log(gameState);
  return (
    <div style={styles.wrapper}>
      <TopBar varient="withBackBtnTopBarGamePlay" />
        {displayTable()}
    </div>
  );
}