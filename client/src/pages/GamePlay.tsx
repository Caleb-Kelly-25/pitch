import Card from "../components/Card";
import HandOfCards from "../components/HandOfCards";
import Table from "../components/Table";
import TopBar from "../components/TopBar";
import PlayerSeat from "../components/PlayerSeat";

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
  cardImage: {
    border: "3px solid #3d2b24", // Border color and thickness
    borderRadius: "15px",        // Rounded corners
    padding: "0px",              // Optional padding inside border
    width: "200px",              // Fixed width
    height: "300px",             // Fixed height
    objectFit: "cover"           // Keep aspect ratio
  },
      table: {
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
},
playerTop: {
    position: "absolute",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
},
playerBottom: {
    position: "absolute",
    bottom: "10%",
    left: "50%",
    transform: "translateX(-50%)",
},
playerLeft: {
    position: "absolute",
    top: "50%",
    left: "10%",
    transform: "translateY(-50%)",
},
playerRight: {
    position: "absolute",
    top: "50%",
    right: "10%",
    transform: "translateY(-50%)",
}
};

export default function GamePlay() {
  return (
    <div style={styles.wrapper}>
      <TopBar varient="withBackBtn"></TopBar>
      
       
         <Table>
        <PlayerSeat position="top">
        <HandOfCards count={5}/>
            </PlayerSeat>
        <PlayerSeat position="left">
        <HandOfCards count={5}/>
            </PlayerSeat>

      <PlayerSeat position="right"> 
        <HandOfCards count={5}/>
            </PlayerSeat>

      <PlayerSeat position="bottom">
        <HandOfCards overlap = {110} cards={[
            { suit: "HEARTS", value: 1 },
            { suit: "SPADES", value: 13 },
            { suit: "DIAMONDS", value: 10 },
            { suit: "CLUBS", value: 7 },
            { suit: "HEARTS", value: 13 }]}/>
            </PlayerSeat>

      <div className="center-table">
        {/* played cards will go here later */}
      </div>
    </Table>
    </div>

       

  );
}