import React from "react";
import { Heart, Diamond, Club, Spade } from "lucide-react";

import BackOfCard from "../assets/BackOfCard.png";
import AH_IMG from "../assets/AH.PNG";
import BJo_IMG from "../assets/BJo.PNG";
import KD_IMG from "../assets/KD.PNG";
import KH_IMG from "../assets/KH.PNG";
import QD_IMG from "../assets/QD.PNG";
import QH_IMG from "../assets/QH.PNG";
import RJo_IMG from "../assets/RJo.PNG";

type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";

export interface CardProps {
  suit?: Suit;
  value?: number; // 1=A, 2-10, 11=Joker, 12=J, 13=Q, 14=K
  faceDown?: boolean;
  image?: string;
  showCorners?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const suitData: Record<
  Suit,
  {
    Icon: React.ComponentType<{
      size?: number;
      color?: string;
      strokeWidth?: number;
    }>;
    color: string;
  }
> = {
  HEARTS:   { Icon: Heart,   color: "red"   },
  DIAMONDS: { Icon: Diamond, color: "red"   },
  CLUBS:    { Icon: Club,    color: "black" },
  SPADES:   { Icon: Spade,   color: "black" },
};

/**
 * Map of (value, suit) → custom PNG.
 * Key format: `${value}-${suit}` e.g. "14-HEARTS", "11-SPADES"
 * For jokers (value 11): HEARTS/DIAMONDS → red joker, CLUBS/SPADES → black joker.
 */
const IMAGE_MAP: Record<string, string> = {
  // Aces
  "1-HEARTS":    AH_IMG,

  // Queens
  "13-HEARTS":   QH_IMG,
  "13-DIAMONDS": QD_IMG,

  // Kings
  "14-HEARTS":   KH_IMG,
  "14-DIAMONDS": KD_IMG,

  // Jokers — red
  "11-HEARTS":   BJo_IMG,
  "11-DIAMONDS": BJo_IMG,

  // Jokers — black
  "11-CLUBS":    BJo_IMG,
  "11-SPADES":   BJo_IMG,
};

function resolveCard(value: number): { display: string; isJoker: boolean } {
  switch (value) {
    case 1:  return { display: "A",  isJoker: false };
    case 11: return { display: "",   isJoker: true  };
    case 12: return { display: "J",  isJoker: false };
    case 13: return { display: "Q",  isJoker: false };
    case 14: return { display: "K",  isJoker: false };
    default: return { display: String(value), isJoker: false };
  }
}

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

export default function Card({
  suit,
  value,
  faceDown = false,
  image,
  showCorners = false,
  onClick,
}: CardProps) {
  if (faceDown) {
    return (
      <button style={{ ...baseStyle, padding: 0, overflow: "hidden" }} onClick={onClick}>
        <img
          src={BackOfCard}
          alt="Card back"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
        />
      </button>
    );
  }

  if (value === undefined) return null;

  // Resolve image: explicit prop > IMAGE_MAP lookup > undefined (standard render)
  const mapKey = suit ? `${value}-${suit}` : undefined;
  const resolvedImage = image ?? (mapKey ? IMAGE_MAP[mapKey] : undefined);

  // --- Image card (custom PNG) ---
  if (resolvedImage) {
    const { display } = resolveCard(value);
    const suitEntry = suit ? suitData[suit] : null;

    return (
      <button style={{ ...baseStyle, padding: 0, overflow: "hidden" }} onClick={onClick}>
        <img
          src={resolvedImage}
          alt="Card face"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px", display: "block" }}
        />

        {showCorners && suitEntry && (
          <>
            {/* Top-left corner */}
            <div style={{
              position: "absolute", top: "6px", left: "8px",
              display: "flex", flexDirection: "column", alignItems: "center",
              color: suitEntry.color, lineHeight: 1,
            }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{display}</span>
              <suitEntry.Icon size={14} strokeWidth={2.5} />
            </div>

            {/* Bottom-right corner (rotated) */}
            <div style={{
              position: "absolute", bottom: "6px", right: "8px",
              display: "flex", flexDirection: "column", alignItems: "center",
              transform: "rotate(180deg)", color: suitEntry.color, lineHeight: 1,
            }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{display}</span>
              <suitEntry.Icon size={14} strokeWidth={2.5} />
            </div>
          </>
        )}
      </button>
    );
  }

  // --- Standard joker fallback (no PNG matched) ---
  const { display, isJoker } = resolveCard(value);

  if (isJoker) {
    return (
      <button style={{ ...baseStyle, color: "black" }} onClick={onClick}>
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
          <div style={{ fontSize: "16px", lineHeight: 1 }}>Joker</div>
        </div>
        <img
          src={Bob_Headshot}
          alt="Joker"
          style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px" }}
        />
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