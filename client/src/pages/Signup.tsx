import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../features/auth/useAuth"
import cardsLogo from "../assets/5_card_logo.png"
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
    objectFit: "contain",
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
    boxSizing: "border-box",
    textAlign: "center",
    letterSpacing: "0.3px",
  },
  inputError: {
    outline: "2px solid #ffaaaa",
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
    alignSelf: "center",
    width: "200px",
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(245,237,224,0.3)",
    margin: "4px 0",
  },
  loginBtn: {
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
  fieldError: {
    color: "#ffcccc",
    fontSize: "13px",
    margin: "-8px 0 0 12px",
  },
  requirementsList: {
    listStyle: "none",
    margin: 0,
    padding: "0 4px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  requirementItem: {
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
}

interface PasswordRequirement {
  label: string
  met: (pw: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "8–20 characters",          met: pw => pw.length >= 8 && pw.length <= 20 },
  { label: "One uppercase letter",      met: pw => /[A-Z]/.test(pw) },
  { label: "One number",                met: pw => /[0-9]/.test(pw) },
  { label: "One special character",     met: pw => /[^a-zA-Z0-9]/.test(pw) },
]

function validateUsername(username: string): string | null {
  if (username.length < 8 || username.length > 20)
    return "Username must be 8–20 characters."
  return null
}

function validatePassword(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every(r => r.met(password))
}

export default function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [showRequirements, setShowRequirements] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { signup: submitSignup } = useAuth()
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
    setSubmitError(null)

    const unErr = validateUsername(username)
    setUsernameError(unErr)
    if (unErr) return

    if (!validatePassword(password)) {
      setShowRequirements(true)
      return
    }

    try {
      await submitSignup(username, password)
      navigate("/")
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Signup failed")
    }
  }

  return (
    <div style={styles.wrapper}>
      <TopBar variant="empty" />
      <div style={styles.main}>
        <div style={styles.leftSection}>
          <h1 style={styles.title}>Pitch</h1>
          <img src={cardsLogo} alt="Playing cards" style={styles.cardsImage} />
        </div>
        <div style={styles.rightSection}>
          <div style={styles.loginBox}>
            <h2 style={styles.loginTitle}>Sign Up</h2>

            <input
              style={{ ...styles.input, ...(usernameError ? styles.inputError : {}) }}
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(null) }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={20}
            />
            {usernameError && <p style={styles.fieldError}>{usernameError}</p>}

            <input
              type="password"
              style={styles.input}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowRequirements(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={20}
            />

            {showRequirements && (
              <ul style={styles.requirementsList}>
                {PASSWORD_REQUIREMENTS.map(req => {
                  const met = req.met(password)
                  return (
                    <li key={req.label} style={styles.requirementItem}>
                      <span style={{ color: met ? "#7dcd7d" : "#ffaaaa", fontSize: "14px", lineHeight: 1 }}>
                        {met ? "✓" : "✗"}
                      </span>
                      <span style={{ color: met ? "rgba(245,237,224,0.8)" : "#ffcccc" }}>
                        {req.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}

            <button style={styles.enterBtn} onClick={handleSubmit}>
              Create Account
            </button>

            {submitError && <p style={styles.fieldError}>{submitError}</p>}

            <hr style={styles.divider} />
            <button style={styles.loginBtn} onClick={() => navigate("/login")}>
              Already have an account? Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
