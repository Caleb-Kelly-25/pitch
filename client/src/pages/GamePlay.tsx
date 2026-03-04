import { Home } from "lucide-react"
import BackOfCard from "../assets/BackOfCard.png";

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
}

export default function GamePlay() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <Home
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={() => window.history.back()}
        />
      </div>
      <div style={styles.main}>
        <h1>Game Play</h1>
        <p>Welcome to the game!</p>
      </div>
    </div>
  );
}