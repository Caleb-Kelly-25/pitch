// import { Home } from "lucide-react"
import { X } from "lucide-react"
import { Settings } from "lucide-react";
import { Info } from "lucide-react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import BackOfCard from "../assets/BackOfCard.png";
import Card from "../components/Card";

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
  topBar: {
    backgroundColor: "#c9c0b8",
    padding: "18px 16px", 
    display: "flex",
    alignItems: "center",
  },
  homeIcon: {
    fontSize: "22px",
    color: "#3d2b24",
    cursor: "pointer",
    lineHeight: 1,
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

function wantToLeave(){
    const confirmLeave = window.confirm("Are you sure you want to leave the game? Your progress will be lost.");
    if (confirmLeave) {
      window.history.back();
    }
}

export default function GamePlay() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <X
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={wantToLeave}
        />
        {/* Will be used to show stats Page*/}
         <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={() => window.history.back()}
         />
         {/* Will be used to show info Page (Tutorial) */}
        <Info
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={() => window.history.back()}
         />
         {/* Will be used to show settings Page*/}
         <Settings
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={() => window.history.back()}
         />
      </div>
      <div style={styles.main}>
        {/* Game Play Content will go here */}
        {/* <img src={car} alt="This is a car image" /> {/* Use the image  */}     
        <img src={BackOfCard} alt="Back of Card" style={styles.cardImage} /> {/* Example card image */}
        <img src={BackOfCard} alt="Back of Card" style={styles.cardImage} /> {/* Example card image */}
        <Card suit="HEARTS" value={1} /> {/* Example of using the Card component */}
        <Card value = {11}  /> {/* Example of a black joker */}
      </div>
    </div>
  );
}