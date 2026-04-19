import "./PlayerSeat.css"

interface PlayerSeatProps {
  position: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}

export default function PlayerSeat({ position, children }: PlayerSeatProps) {
  return (
    <div className={`player-seat ${position}`}>
      {children}
    </div>
  )
}
