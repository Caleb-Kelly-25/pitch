import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../auth/useAuth";
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
  },
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "32px",
  },
  title: {
    fontSize: "clamp(72px, 10vw, 120px)",
    fontFamily: "'Palatino Linotype', 'Palatino', 'Book Antiqua', serif",
    color: "#f5ede0",
    margin: 0,
    letterSpacing: "-2px",
    textShadow: "3px 4px 8px rgba(0,0,0,0.5)",
    lineHeight: 1,
  },
  cardsImage: {
    width: "300px",
    height: "auto",
    objectFit: "contain" as const,
  },
  rightSection: {
    width: "340px",
    flexShrink: 0,
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

  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    setError(null);
    try {
      const token = (await login(username, password)).accessToken;
      saveToken(token);
      navigate("/game");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Top nav bar */}
      <div style={styles.topBar}>
        <span style={styles.homeIcon} onClick={() => navigate("/")}>
          🏠
        </span>
      </div>

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
