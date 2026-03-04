import { ArrowLeft } from "lucide-react"
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

async function handleSubmit() {
    //Validate Game Code and Join Game
  }

export default function JoinPublic() {
    
    return(
        <div style={styles.wrapper}>
            {/* Top Nav Bar */}
            <div style={styles.topBar}>
                <ArrowLeft
                    size={45}
                    color="#3d2b24"
                    style={{cursor: "pointer"}}
                    onClick={() => window.history.back()}
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
             {/* Main Content */}
                <div style={(styles.main)}>
             
                     <h1>Join Public Game</h1>
                 <input
            //   type="password"
                      style={styles.input}
                      placeholder="Game Code"
            //   value={password}
            //below, Validate Game Code and Join Game on enter key press
            //   onChange={(e) => setPassword(e.target.value)}
            //   onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

                <button style={styles.enterBtn} onClick={handleSubmit}>
                    Enter
                </button>
            </div>
        </div>
    )
}