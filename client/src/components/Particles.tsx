export function EmberParticles() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100
        const size = 2 + Math.random() * 5
        const duration = 8 + Math.random() * 12
        const delay = Math.random() * 10

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "-5%",
              left: `${left}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: "rgba(255,220,160,0.6)",
              boxShadow: "0 0 10px rgba(255,220,160,0.6)",
              animation: `emberFloat ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export function FloatingSuits() {
  const suits = ["♠", "♥", "♦", "♣"]

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {Array.from({ length: 18 }).map((_, i) => {
        const left = Math.random() * 100
        const duration = 20 + Math.random() * 20
        const delay = Math.random() * 20
        const size = 24 + Math.random() * 40
        const suit = suits[Math.floor(Math.random() * suits.length)]

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "-10%",
              left: `${left}%`,
              fontSize: size,
              color:
                suit === "♥" || suit === "♦"
                  ? "rgba(255,120,120,0.32)"
                  : "rgba(255,255,255,0.30)",
              animation: `floatSuit ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              userSelect: "none",
            }}
          >
            {suit}
          </div>
        )
      })}
    </div>
  )
}