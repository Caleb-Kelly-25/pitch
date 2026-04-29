import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import cardsLogo from "../assets/5_card_logo.png"
import { useAuth } from "../features/auth/useAuth"
import TopBar from "../components/TopBar"

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
    position: "fixed",
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
    textAlign: "center",
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
    color: "#211A17",
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
}

const ease = { duration: 0.45, ease: "easeOut" } as const
const spring = { type: "spring", stiffness: 380, damping: 24 } as const

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { login: submitLogin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const prev = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
    }
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.margin = prev.margin
      document.body.style.padding = prev.padding
      document.body.style.overflow = prev.overflow
    }
  }, [])

  async function handleSubmit() {
    setError(null)
    try {
      await submitLogin(username, password)
      navigate("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div style={styles.wrapper}>
      <TopBar variant="empty" />
      <div style={styles.main}>

        {/* Left — title + cards image */}
        <motion.div
          style={styles.leftSection}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={ease}
        >
          <motion.h1
            style={styles.title}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...ease, delay: 0.08 }}
          >
            Pitch
          </motion.h1>
          <motion.img
            src={cardsLogo}
            alt="Playing cards"
            style={styles.cardsImage}
            initial={{ rotate: -6, opacity: 0, scale: 0.88 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ ...ease, delay: 0.16 }}
          />
        </motion.div>

        {/* Right — login form */}
        <motion.div
          style={styles.rightSection}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...ease, delay: 0.08 }}
        >
          <div style={styles.loginBox}>
            <motion.h2
              style={styles.loginTitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
            >
              Log In
            </motion.h2>

            <motion.input
              style={styles.input}
              placeholder="Username/Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            />
            <motion.input
              type="password"
              style={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
            />

            <motion.button
              style={styles.enterBtn}
              onClick={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
              whileTap={{ scale: 0.96 }}
            >
              Enter
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  style={styles.error}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <hr style={styles.divider} />

            <motion.button
              style={styles.signupBtn}
              onClick={() => navigate("/signup")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 }}
              whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
              whileTap={{ scale: 0.97 }}
            >
              New User? Sign up
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
