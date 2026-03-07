import "./PlayerSeat.css";

function PlayerSeat({ position, children }) {
  return (
    <div className={`player-seat ${position}`}>
      {children}
    </div>
  );
}

export default PlayerSeat;