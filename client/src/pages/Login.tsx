import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import cardsLogo from "../assets/5_card_logo.png";
import { useAuth } from "../features/auth/useAuth";
import TopBar from "../components/TopBar";
// import { Home } from "lucide-react";

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
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    marginLeft: "-100px",
  },
  title: {
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
  rightSection: {
    width: "clamp(320px, 50vw, 440px)",
    flexShrink: 0,
    marginRight: "150px",
  },
  loginBox: {
    backgroundColor: "rgba(170, 130, 120, 0.45)",
    borderRadius: "20px",
    padding: "36px 32px",
    backdropFilter: "blur(4px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  loginTitle: {
    color: "#f5ede0",
    fontSize: "22px",
    textAlign: "center" as const,
    margin: 0,
    fontFamily: "'Palatino Linotype', serif",
    fontWeight: "normal",
    letterSpacing: "0.5px",
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
  divider: {
    border: "none",
    borderTop: "1px solid rgba(245,237,224,0.3)",
    margin: "4px 0",
  },
  signupBtn: {
    padding: "14px 20px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: "rgba(200, 175, 165, 0.5)",
    color: "#f5ede0",
    fontSize: "15px",
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    letterSpacing: "0.3px",
    width: "100%",
  },
  error: {
    color: "#ffcccc",
    fontSize: "14px",
    textAlign: "center" as const,
    margin: 0,
  },
};


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login: submitLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const prev = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
    };
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.margin = prev.margin;
      document.body.style.padding = prev.padding;
      document.body.style.overflow = prev.overflow;
    };
  }, []);

  async function handleSubmit() {
    setError(null);
    try {
      await submitLogin(username, password);
      navigate("/LandingPage");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Top nav bar */}
      <TopBar varient="empty"></TopBar>

      {/* Main content */}
      <div style={styles.main}>
        {/* Left: Title + Cards */}
        <div style={styles.leftSection}>
          <h1 style={styles.title}>Pitch</h1>
          <img
            src={cardsLogo}
            alt="Playing cards"
            style={styles.cardsImage}
          />
        </div>

        {/* Right: Login form */}
        <div style={styles.rightSection}>
          <div style={styles.loginBox}>
            <h2 style={styles.loginTitle}>Log In</h2>

            <input
              style={styles.input}
              placeholder="Username/Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <input
              type="password"
              style={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <button style={styles.enterBtn} onClick={handleSubmit}>
              Enter
            </button>

            {error && <p style={styles.error}>{error}</p>}

            <hr style={styles.divider} />

            <button style={styles.signupBtn} onClick={() => navigate("/signup")}>
              New User? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}