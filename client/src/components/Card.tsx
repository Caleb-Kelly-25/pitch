import React from "react";
import { Heart, Diamond, Club, Spade } from "lucide-react";
// import JokerImage from "../assets/Firestone_Headshot.png";
import JokerImage from "../assets/Bob_Headshot.jpg";
import BackOfCard from "../assets/BackOfCard.png"


type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";

export interface CardProps {
  suit?: Suit;
  value?: number; // 1=A, 2-10, 11=Joker, 12=J, 13=Q, 14=K
  faceDown?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const suitData: Record<
  Suit,
  { Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; color: string }
> = {
  HEARTS: { Icon: Heart, color: "red" },
  DIAMONDS: { Icon: Diamond, color: "red" },
  CLUBS: { Icon: Club, color: "black" },
  SPADES: { Icon: Spade, color: "black" },
};

function resolveCard(value: number): { display: string; isJoker: boolean; } {
  switch (value) {
    case 1:  return { display: "A",    isJoker: false };
    case 11: return { display: "",     isJoker: true  };
    case 12: return { display: "J",    isJoker: false };
    case 13: return { display: "Q",    isJoker: false };
    case 14: return { display: "K",    isJoker: false };
    default: return { display: String(value), isJoker: false };
  }
}

export default function Card({ suit, value, faceDown = false, highlighted = false, dimmed = false, onClick }: CardProps) {
  const baseStyle: React.CSSProperties = {
    width: "120px",
    height: "170px",
    borderRadius: "12px",
    border: highlighted ? "2px solid gold" : "2px solid #222",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
    cursor: onClick ? "pointer" : "default",
    boxShadow: highlighted
      ? "0 0 10px 3px gold, 2px 4px 8px rgba(0,0,0,0.2)"
      : "2px 4px 8px rgba(0,0,0,0.2)",
    fontFamily: "serif",
    position: "relative",
    opacity: dimmed ? 0.4 : 1,
    transition: "opacity 0.15s, box-shadow 0.15s",
  };

    if (faceDown) {
    return (
      <button
        style={{ ...baseStyle, padding: 0, overflow: "hidden" }}
        onClick={onClick}
      >
        <img
          src={BackOfCard}
          alt="Card back"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
        />
      </button>
    );
  }

  if (value === undefined) return null;

  const { display, isJoker } = resolveCard(value);

  if (isJoker) {
    return (
      <button style={{ ...baseStyle, color: "black" }} onClick={onClick}>
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
          <div style={{ fontSize: "16px", lineHeight: 1 }}>Joker</div>
        </div>
        <img src={JokerImage} alt="Joker" style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px" }} />
        <div style={{ display: "flex", flexDirection: "column", transform: "rotate(180deg)", alignSelf: "flex-end" }}>
          <div style={{ fontSize: "16px", lineHeight: 1 }}>Joker</div>
        </div>
      </button>
    );
  }

  if (!suit) return null;

  const { Icon, color } = suitData[suit];

  return (
    <button style={{ ...baseStyle, color }} onClick={onClick}>
      <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
        <div style={{ fontSize: "16px", lineHeight: 1 }}>{display}</div>
        <Icon size={24} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", transform: "rotate(180deg)", alignSelf: "flex-end" }}>
        <div style={{ fontSize: "16px", lineHeight: 1 }}>{display}</div>
        <Icon size={24} />
      </div>
    </button>
  );
}