import "./PlayerSeat.css";

interface PlayerSeatProps {
  position: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  isActive?: boolean;
}

export default function PlayerSeat({ position, children, isActive = false }: PlayerSeatProps) {
  return (
    <div className={`player-seat ${position}${isActive ? " active" : ""}`}>
      {children}
    </div>
  );
}
