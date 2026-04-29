import { useEffect } from "react"
import { useNavigate } from "react-router"
import { motion } from "motion/react"
import { useAuth } from "../features/auth/useAuth"
import { connectSocket } from "../lib/socket"
import cardsLogo from "../assets/5_card_logo.png"
import TopBar from "../components/TopBar"
import AmbientMusic from "../components/AmbientMusic"

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
    textAlign: "left",
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
    backgroundColor: "#8b1a1a",
    color: "#f5ede0",
    fontSize: "24px",
    fontFamily: "'Palatino Linotype', serif",
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)",
    width: "200px",
  },
}

const ease = { duration: 0.48, ease: "easeOut" } as const

export default function LandingPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    connectSocket(token)
  }, [token])

  return (
    <div style={styles.wrapper}>
      <AmbientMusic />
      <TopBar variant="withoutBackBtn" />
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
            initial={{ y: -24, opacity: 0 }}
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

        {/* Right — Host / Join buttons */}
        <motion.div
          style={styles.rightSection}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...ease, delay: 0.1 }}
        >
          <motion.div
            style={styles.optionBlock}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.22 }}
          >
            <h1 style={styles.optionTitle}>Host</h1>
            <motion.button
              style={styles.button}
              onClick={() => navigate("/host")}
              whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
              whileTap={{ scale: 0.96 }}
            >
              Create Game
            </motion.button>
          </motion.div>

          <motion.div
            style={styles.optionBlock}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ease, delay: 0.32 }}
          >
            <h1 style={styles.optionTitle}>Join</h1>
            <motion.button
              style={styles.button}
              onClick={() => navigate("/join")}
              whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
              whileTap={{ scale: 0.96 }}
            >
              Find Game
            </motion.button>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}
