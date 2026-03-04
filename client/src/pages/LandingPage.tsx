import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { connectSocket } from "../socket/socket";
import { useNavigate } from "react-router";
import cardsLogo from "../assets/5_card_logo.png";
// import { Home } from "lucide-react";
import { Settings } from "lucide-react";
import { Info } from "lucide-react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";


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
  title:{
    fontSize: "clamp(100px, 8vw, 200px)",
    fontFamily: "'Palatino Linotype', 'Palatino', 'Book Antiqua', serif",
    color: "#f5ede0",
    margin: 50,
    letterSpacing: "-2px",
    textShadow: "3px 4px 8px rgba(0,0,0,0.5)",
    lineHeight: 1,
  },
  cardsImage: {
    width: "clamp(280px, 40vw, 500px)",
    height: "auto",
    objectFit: "contain" as const,
  },
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    marginLeft: "-140px",
  },
  rightSection: {
    width: "clamp(300px, 50vw, 400px)",
    flexShrink: 0,
    marginRight: "150px",
    textAlign: "left"
  },
  optionBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  optionTitle: {
    color: "#f5ede0",
    fontSize: "64px",
    marginBottom: "8px",
  },
  button: {
    padding: "13px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "linear-gradient(to bottom, #E05254, #7A2C2E)",
    color: "#f5ede0",
    fontSize: "24px",
    fontFamily: "'Palatino Linotype', serif",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)",
    width: "200px",
  }
};

export default function LandingPage() {
  // const { token } = useAuth();
  // const [textMsg, setTextMsg] = useState("Waiting...");

  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!token) return;

  //   setTextMsg(JSON.stringify(token));

  //   const socket = connectSocket(token);

  //   socket.on("Message", (msg: string) => {
  //       setTextMsg(msg);
  //   })

  //   socket.on("connect", () => {
  //     console.log("Connected to game server");
  //     socket.emit("joinGame", "default-game");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [token]);

  return (
    <div style={styles.wrapper}>
         {/* Top Nav Bar */}
      <div style={styles.topBar}>
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
          {/* Main Content */}
      <div style={(styles.main)}>
        {/* Left: Game title and logo */}
        <div style={styles.leftSection}>
          <h1 style={styles.title}>Pitch</h1>
          <img
            src={cardsLogo}
            alt="Playing cards"
            style={styles.cardsImage}
            />
          </div>

          {/* Right: Buttons to choose how to start game */}
           <div style={styles.rightSection}>
            <div style={styles.optionBlock}>
              <h1 style={styles.optionTitle}>Host</h1>
              <button style={styles.button} onClick={() => navigate("/host")}>
                Create Game
              </button>
            </div>
            <div style={styles.optionBlock}>
              <h1 style={styles.optionTitle}>Public</h1>
              <button style={styles.button} onClick={() => navigate("/join-public")}>
                Find Game
              </button>
            </div>

            <div style={styles.optionBlock}>
              <h1 style={styles.optionTitle}>Private</h1>
              <button style={styles.button} onClick={() => navigate("/join-private")}>
                Join Game
              </button>
            </div>
        </div>
      </div>
    </div>  
  );
}