import { useGame } from "../features/game/useGame";
import TopBar from "../components/TopBar";

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    backgroundColor: "#f0ebe5",
    position: "fixed" as const,
    top: 0,
    left: 0,
    overflow: "hidden",
  },
   main: {
    flex: 1,
    backgroundColor: "#7d2a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(24px, 4vh, 48px) clamp(32px, 5vw, 80px)",
    gap: "clamp(20px, 3vw, 40px)",
    backgroundImage:
      "radial-gradient(ellipse at 30% 50%, rgba(120,40,40,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(50,10,10,0.4) 0%, transparent 50%)",
    overflow: "hidden",
  },
}

/* function getGameCode() generates a random place holder game code. Later this fucnction will be updated to actually call the backend for a functioning game code.*/
function getGameCode(){
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Host() {


  const game = useGame();
  console.log("Current game state: ", game);


    return(
        <div style={styles.wrapper}>
            {/* Top Nav Bar */}
            <TopBar varient="withBackBtn"></TopBar>
            {/* Main Content */}
                <div style={(styles.main)}>
                        <h1>Host Game</h1>
                        <h2>Game Code: {getGameCode()}</h2>
                        <h3>Waiting for players...</h3>
                        {/* <h3>Waiting for {getNeededPlayers()} players</h3> */}
                </div>
        </div>
    );
}