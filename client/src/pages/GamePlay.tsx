import Card from "../components/Card";
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
  cardImage: {
    border: "3px solid #3d2b24", // Border color and thickness
    borderRadius: "15px",        // Rounded corners
    padding: "0px",              // Optional padding inside border
    width: "200px",              // Fixed width
    height: "300px",             // Fixed height
    objectFit: "cover"           // Keep aspect ratio
  }
};

export default function GamePlay() {
  return (
    <div style={styles.wrapper}>
      <TopBar varient="withBackBtn"></TopBar>
      <div style={styles.main}>
        {/* Game Play Content will go here */}
        {/* <img src={car} alt="This is a car image" /> {/* Use the image  */}     
        <Card faceDown /> {/* Example of a face-down card */}
        <Card suit="HEARTS" value={1} /> {/* Example of using the Card component */}
        <Card value = {11}  /> {/* Example of a black joker */}
      </div>
    </div>
  );
}