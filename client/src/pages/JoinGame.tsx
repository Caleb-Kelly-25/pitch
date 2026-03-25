import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { useAuth } from "../features/auth/useAuth";
import { joinGame } from "../features/game/gameService";
import { registerGameSocketHandlers } from "../features/game/registerGameSocketHandlers";
import { useGame } from "../features/game/useGame";
import { useNavigate } from "react-router-dom";

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
    enterBtn: {
        padding: "13px 20px",
        borderRadius: "30px",
        border: "none",
        backgroundColor: "#8b1a1a",
        color: "#f5ede0",
        fontSize: "17px",
        fontFamily: "'Palatino Linotype', serif",
        cursor: "pointer",
        letterSpacing: "0.5px",
        boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)",
        alignSelf: "center" as const,
        width: "160px",
    },
    input: {
        width: "100%",
        padding: "14px 20px",
        borderRadius: "30px",
        border: "none",
        backgroundColor: "rgba(200, 175, 165, 0.6)",
        color: "#3d2b24",
        fontSize: "16px",
        fontFamily: "'Georgia', serif",
        outline: "none",
        boxSizing: "border-box" as const,
        textAlign: "center" as const,
        letterSpacing: "0.3px",
  },
}

async function handleSubmit(password: string, token:string|null) {
    //Validate Game Code and Join Game
    joinGame(password, token || "");
  }

export default function JoinPublic() {
    const navigate = useNavigate();
    const gameState = useGame();
    const [password, setPassword] = useState("");
    const token = useAuth().token;
    if (gameState.gameId === "" || gameState.phase == "WAITING" || gameState.players.length < 4) {
    return(
        <div style={styles.wrapper}>
              {/* Top Nav Bar */}
              <TopBar varient="withBackBtn"></TopBar>
             {/* Main Content */}
                <div style={(styles.main)}>
             
                     <h1>Join Game</h1>
                     <h2>Select from options to join public game, or input code to join private game</h2>
                 <input
            //   type="password"
                      style={styles.input}
                      placeholder="Game Code"
               value={password}
                      onChange={(e) => setPassword(e.target.value)}
            />

                <button style={styles.enterBtn} onClick={() => handleSubmit(password, token)}>
                    Enter
                </button>
            </div>
        </div>
    )
} else {
    return(<>{navigate("/GamePlay")}</>);
}
}