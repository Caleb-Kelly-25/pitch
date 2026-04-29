import { useEffect } from "react"
import { motion } from "motion/react"
import { useAmbientMusic } from "../hooks/useAmbientMusic"

export default function AmbientMusic() {
  const { start, stop, toggle, muted } = useAmbientMusic()

  useEffect(() => {
    start()
    return stop
  }, [start, stop])

  return (
    <motion.button
      onClick={toggle}
      title={muted ? "Unmute music" : "Mute music"}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.12, boxShadow: "0 0 18px rgba(196,154,46,0.55)" }}
      whileTap={{ scale: 0.92 }}
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 500,
        background: "rgba(25,12,0,0.78)",
        border: `1.5px solid ${muted ? "rgba(196,154,46,0.3)" : "#c49a2e"}`,
        borderRadius: "50%",
        width: 46,
        height: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 22,
        color: muted ? "rgba(196,154,46,0.35)" : "#c49a2e",
        padding: 0,
        lineHeight: 1,
        boxShadow: muted
          ? "none"
          : "0 0 10px rgba(196,154,46,0.28), inset 0 0 6px rgba(196,154,46,0.06)",
        transition: "border-color 0.4s, color 0.4s, box-shadow 0.4s",
      }}
    >
      ♫
    </motion.button>
  )
}
