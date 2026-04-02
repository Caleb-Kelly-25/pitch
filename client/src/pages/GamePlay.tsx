import HandOfCards from "../components/HandOfCards";
import Table from "../components/Table";
import TopBar from "../components/TopBar";
import PlayerSeat from "../components/PlayerSeat";
import { useGame } from "../features/game/useGame";
import type { CardProps } from "../components/Card";
import { playCard } from "../features/game/gameService";
import { useAuth } from "../features/auth/useAuth";

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
  title: {
    position: "fixed",       // float above the page
    top: "50%",              // vertical center
    left: "50%",             // horizontal center
    transform: "translate(-50%, -50%)", // truly center
    fontSize: "2rem",
    color: "white",
    textAlign: "center",
    zIndex: 1000,            // make sure it's above other content
    pointerEvents: "none",   // lets clicks pass through if needed
  },
    buttonStyle: {
      fontSize: "1rem",      // controls the text size
      padding: "10px 20px",  // makes the button larger or smaller
      margin: "5px",         // space between buttons
      borderRadius: "8px",   // rounded corners
      cursor: "pointer",     // changes cursor on hover
      backgroundColor: "linear-gradient(to bottom, #E05254, #7A2C2E)",
      color: "#f5ede0",
      border: "none",        // remove default browser border
      transition: "background-color 0.2s", // smooth hover effect
  },
};

// This function is used to determine the current phase of the game call coresponding functions
export function determinePhase() {
  const gameState = useGame();
  if (gameState.phase === "WAITING") {
    return (
      <div>
          <div style = {styles.title}>Waiting for players to join...
          </div>
      </div>
      );
  }
  else if (gameState.phase === "BIDDING") {
    displayTable();
    displayScore();
    biddingPhase();
    pickSuit();
    
    return(
      <>
        {displayTable()}
        {/* {displayScore()} */}
        {biddingPhase()}
      </>
    );
    
    //TODO: learn how to return multiple functions in react, may need to make a new component for the bidding phase
  } else if (gameState.phase === "PLAYING") {
    return displayTable(),displayScore();
    
  } else if (gameState.phase === "COMPLETE") {
    return "Complete phase";
  } else {
    return "Unknown phase";
  }
}

export function displayTable() {
  const gameState = useGame();
  const auth = useAuth();
  const ourIndex = gameState.players.findIndex(p => p.id === auth.user?.id);
  return (
    <Table
        bottom = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[(0+ourIndex)%4].id)?.card}
        left = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[(1+ourIndex)%4].id)?.card}
        top = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[(2+ourIndex)%4].id)?.card}
        right = {gameState.trick.playedCards.find(p => p.playerId === gameState.players[(3+ourIndex)%4].id)?.card}
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

export function biddingPhase(){
  //If your turn
  if (useGame().bidding.currentBidderId === useGame().players.find(p => p.id === useAuth().user?.id)?.id) {
      // a conditional so if no one bids, the dealer starts with a 5 bid
    if (useGame().bidding.bids.every(bid => bid === undefined)) {
      return (
      <div>
          <div style = {styles.title}> You are the dealer. If no one bids, you start with a 5 bid. It's your turn to bid. Please select a bid or pass.
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(5)}>5</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(6)}>6</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(7)}>7</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(8)}>8</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(9)}>9</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(10)}>10</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(11)}>Shoot the Moon</button>
        </div> 
        </div>   
        );
    } else {
      return (
        <div>
          <div style = {styles.title}>It's your turn to bid. Please select a bid or pass.
          </div>
            biddingButtons()
        </div>
    )
  } 
  //If not your turn
  } else {  
     //May cause issues if you are the highest bidder, not sure if it will let you choose the suit
   
    if (useGame().bidding.bids.every(bid => bid !== undefined)) {
      return pickSuit();
    } else if (useGame().bidding.highestBidderId === useGame().players.find(p => p.id === useAuth().user?.id)?.id){
      return <div>
          <div style = {styles.title}>You are the highest bidder. Please wait for other players to bid or pass.
          </div>
        </div>
    } else { return "Waiting for other players to bid...";}
  }
}

export function biddingButtons(){
  //TODO: implement actual bidding options and logic
  return(<div style = {styles.title}> <button onClick={() => useGame().placeBid(0)}>Pass</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(5)}>5</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(6)}>6</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(7)}>7</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(8)}>8</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(9)}>9</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(10)}>10</button>
          <button style = {styles.buttonStyle}onClick={() => useGame().placeBid(11)}>Shoot the Moon</button>
        </div>  
        );
}

export function pickSuit() {  
  if (useGame().bidding.bids.every(bid => bid !== undefined)) {
    if (useGame().bidding.highestBidderId === useGame().players.find(p => p.id === useAuth().user?.id)?.id) {
      return (<div>
        <div style = {styles.title}>You won the bid! Please select a suit to lead with.
        <button style = {styles.buttonStyle}onClick={() => useGame().pickSuit("HEARTS")}>Hearts</button>
        <button style = {styles.buttonStyle}onClick={() => useGame().pickSuit("DIAMONDS")}>Diamonds</button>
        <button style = {styles.buttonStyle}onClick={() => useGame().pickSuit("CLUBS")}>Clubs</button>
        <button style = {styles.buttonStyle}onClick={() => useGame().pickSuit("SPADES")}>Spades</button>
        </div>
      </div>)
    } else {
      return <div>
          <div style = {styles.title}>Waiting for the highest bidder to select a suit...
          </div>
        </div>
    }
  }
}

export default function GamePlay() {
  const gameState = useGame();
  console.log(gameState);
  return (
    <div style={styles.wrapper}>
      <TopBar varient="withBackBtnTopBarGamePlay" />
        {determinePhase()}
    </div>
  );
}