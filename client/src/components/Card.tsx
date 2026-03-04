import React from "react";
import { Heart, Diamond, Club, Spade } from "lucide-react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";

type Value =
  | "A"
  | "2" | "3" | "4" | "5" | "6" | "7"
  | "8" | "9" | "10"
  | "J" | "Q" | "K";

interface CardProps {
  suit?: Suit;
  value?: Value;
  isJoker?: boolean;
  jokerColor?: "red" | "black";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const suitData: Record<
  Suit,
  { Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; color: string }
> = {
  hearts: { Icon: Heart, color: "red" },
  diamonds: { Icon: Diamond, color: "red" },
  clubs: { Icon: Club, color: "black" },
  spades: { Icon: Spade, color: "black" },
};

export default function Card({
  suit,
  value,
  isJoker = false,
  jokerColor = "black",
  onClick,
}: CardProps) {
  const baseStyle: React.CSSProperties = {
    width: "120px",
    height: "170px",
    borderRadius: "12px",
    border: "2px solid #222",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
    cursor: "pointer",
    boxShadow: "2px 4px 8px rgba(0,0,0,0.2)",
    fontFamily: "serif",
    position: "relative",
  };

  if (isJoker) {
    return (
      <button
        style={{ ...baseStyle, color: jokerColor }}
        onClick={onClick}
      >
        <div>JOKER</div>
        <div style={{ fontSize: "40px", textAlign: "center" }}>🃏</div>
        <div style={{ transform: "rotate(180deg)" }}>JOKER</div>
      </button>
    );
  }

  if (!suit || !value) return null;

  const { Icon, color } = suitData[suit];

    return (
        <button style={{ ...baseStyle, color }} onClick={onClick}>
        {/* Top-left */}
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
        <div style={{ fontSize: "16px", lineHeight: 1 }}>{value}</div>
        <Icon size={26} />
        </div>

        {/* Bottom-right */}
        <div style={{ display: "flex", flexDirection: "column", transform: "rotate(180deg)", alignSelf: "flex-end" }}>
            <div style={{ fontSize: "16px", lineHeight: 1 }}>{value}</div>
            <Icon size={26} />
        </div>
        </button>
    );
}
