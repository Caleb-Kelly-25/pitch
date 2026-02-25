import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { connectSocket } from "../socket/socket";
import { useNavigate } from "react-router";
import cardsLogo from "../assets/5_card_logo.png";


const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "'Georgia', serif",
    backgroundColor: "#f0ebe5",
  },
  topBar: {
    backgroundColor: "#c9c0b8",
    padding: "10px 16px", 
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
    padding: "48px 80px",
    gap: "40px",
    backgroundImage:
      "radial-gradient(ellipse at 30% 50%, rgba(120,40,40,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(50,10,10,0.4) 0%, transparent 50%)",
  }

};


export default function Game() {
  const { token } = useAuth();
  const [textMsg, setTextMsg] = useState("Waiting...");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    setTextMsg(JSON.stringify(token));

    const socket = connectSocket(token);

    socket.on("Message", (msg: string) => {
        setTextMsg(msg);
    })

    socket.on("connect", () => {
      console.log("Connected to game server");
      socket.emit("joinGame", "default-game");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // return<><h1>Pitch Game</h1><p>{"Create buttons to host, join public, or join private games"}</p></>;
  //code below is for testing frontend visuals, will be implemented once considered safe to do so. 

  return (
    <div style={styles.wrapper}>
         {/* Top Nav Bar */}
      <div style={styles.topBar}>
        <span style={styles.homeIcon} onClick={() => navigate("/")}>
          🏠
        </span>
      </div>
          {/* Main Content */}
      <div style={(styles.main)}>
        <div style={styles.leftSection}>
          <h1 style={styles.title}>Pitch</h1>
          <img
            src={cardsLogo}
            alt="Playing cards"
            style={styles.cardsImage}
            />

            {/* Right: Buttons to choose how to start game */}
            <div style={styles.rightSection}>

              <button style={styles.button} onClick={() => navigate("/host")}>
                Host Game
              </button>

              <button style={styles.button} onClick={() => navigate("/join-public")}>
                Join Public Game
              </button>

              <button style={styles.button} onClick={() => navigate("/join-private")}>
                Join Private Game
              </button>
            </div>
        </div>
      </div>

      
    </div>
  );

}
