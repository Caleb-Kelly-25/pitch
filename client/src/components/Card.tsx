import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, Diamond, Club, Spade } from "lucide-react";
import JokerImage from "../assets/Bob_Headshot.jpg";
import BackOfCard from "../assets/BackOfCard.png";
// HEARTS
import _AH  from "../assets/AH.png";
import _KH  from "../assets/KH.png";
import _QH  from "../assets/QH.png";
import _JH  from "../assets/JH.png";

// DIAMONDS
import _AD  from "../assets/AD.png";
import _KD  from "../assets/KD.png";
import _QD  from "../assets/QD.png";
import _JD  from "../assets/JD.png";

// CLUBS
import _AC  from "../assets/AC.png";
import _KC  from "../assets/KC.png";
import _QC  from "../assets/QC.png";
import _JC  from "../assets/JC.png";

// SPADES
import _AS  from "../assets/AS.png";
import _KS  from "../assets/KS.png";
import _QS  from "../assets/QS.png";

// JOKERS
import _BJo from "../assets/BJo.png";
import _RJo from "../assets/RJo.png";

// Map "value-SUIT" → image URL for cards that have a custom asset.
// Jokers keyed as "joker-black" / "joker-red".
const CARD_IMAGE_MAP: Record<string, string> = {
  // HEARTS
  "14-HEARTS":   _KH,
  "13-HEARTS":   _QH,
  "12-HEARTS":   _JH,
  "1-HEARTS":    _AH,

  // DIAMONDS
  "14-DIAMONDS": _KD,
  "13-DIAMONDS": _QD,
  "12-DIAMONDS": _JD,
  "1-DIAMONDS":  _AD,

  // CLUBS
  "14-CLUBS":    _KC,
  "13-CLUBS":    _QC,
  "12-CLUBS":    _JC,
  "1-CLUBS":     _AC,

  // SPADES
  "14-SPADES":   _KS,
  "13-SPADES":   _QS,
  "1-SPADES":    _AS,

  // JOKERS
  "joker-black": _BJo,
  "joker-red":   _RJo,
};

function getCardImage(value: number, suit?: Suit): string | null {
  if (value === 11) {
    // Use suit colour to choose joker image
    const isRed = suit === "HEARTS" || suit === "DIAMONDS";
    return isRed ? CARD_IMAGE_MAP["joker-red"] : CARD_IMAGE_MAP["joker-black"];
  }
  return CARD_IMAGE_MAP[`${value}-${suit}`] ?? null;
}

type Suit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";

export interface CardProps {
  suit?: Suit;
  value?: number;
  faceDown?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const suitData: Record<
  Suit,
  { Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; color: string }
> = {
  HEARTS:   { Icon: Heart,   color: "red" },
  DIAMONDS: { Icon: Diamond, color: "red" },
  CLUBS:    { Icon: Club,    color: "black" },
  SPADES:   { Icon: Spade,   color: "black" },
};

function resolveCard(value: number): { display: string; isJoker: boolean } {
  switch (value) {
    case 1:  return { display: "A",    isJoker: false };
    case 11: return { display: "",     isJoker: true  };
    case 12: return { display: "J",    isJoker: false };
    case 13: return { display: "Q",    isJoker: false };
    case 14: return { display: "K",    isJoker: false };
    default: return { display: String(value), isJoker: false };
  }
}

const BASE_STYLE: React.CSSProperties = {
  width: "120px",
  height: "170px",
  borderRadius: "12px",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "10px",
  fontFamily: "serif",
  position: "relative",
  userSelect: "none",
  WebkitUserSelect: "none",
  flexShrink: 0,
};

export default function Card({
  suit, value, faceDown = false, highlighted = false, dimmed = false, onClick,
}: CardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [9, -9]), { stiffness: 420, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), { stiffness: 420, damping: 30 });

  const interactive = !!onClick && !dimmed;

  function handleMouseMove(e: React.MouseEvent) {
    if (!interactive) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const border = highlighted ? "2px solid gold" : "2px solid #222";
  const boxShadow = highlighted
    ? "0 0 10px 3px gold, 2px 4px 8px rgba(0,0,0,0.2)"
    : "2px 4px 8px rgba(0,0,0,0.2)";

  const sharedProps = {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    whileTap: interactive ? { scale: 0.94 } : undefined,
    whileHover: interactive
      ? {
          y: -14,
          boxShadow: highlighted
            ? "0 0 20px 8px gold, 4px 18px 28px rgba(0,0,0,0.45)"
            : "4px 18px 28px rgba(0,0,0,0.45)",
        }
      : undefined,
    transition: { type: "spring" as const, stiffness: 360, damping: 26 },
    style: {
      ...BASE_STYLE,
      border,
      boxShadow,
      cursor: onClick ? "pointer" : "default",
      opacity: dimmed ? 0.4 : 1,
      rotateX,
      rotateY,
    },
    onClick,
  };

  if (faceDown) {
    return (
      <motion.button {...sharedProps} style={{ ...sharedProps.style, padding: 0, overflow: "hidden" }}>
        <img
          src={BackOfCard}
          alt="Card back"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
        />
      </motion.button>
    );
  }

  if (value === undefined) return null;

  const customImg = getCardImage(value, suit);
  if (customImg) {
    return (
      <motion.button {...sharedProps} style={{ ...sharedProps.style, padding: 0, overflow: "hidden" }}>
        <img
          src={customImg}
          alt={suit ? `${value} of ${suit}` : "Joker"}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
        />
      </motion.button>
    );
  }
  const { display, isJoker } = resolveCard(value);

  if (isJoker) {
    return (
      <motion.button {...sharedProps} style={{ ...sharedProps.style, color: "black" }}>
        <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
          <div style={{ fontSize: "16px", lineHeight: 1 }}>Joker</div>
        </div>
        <img
          src={JokerImage}
          alt="Joker"
          style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px" }}
        />
        <div style={{ display: "flex", flexDirection: "column", transform: "rotate(180deg)", alignSelf: "flex-end" }}>
          <div style={{ fontSize: "16px", lineHeight: 1 }}>Joker</div>
        </div>
      </motion.button>
    );
  }

  if (!suit) return null;
  const { Icon, color } = suitData[suit];

  return (
    <motion.button {...sharedProps} style={{ ...sharedProps.style, color }}>
      <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
        <div style={{ fontSize: "16px", lineHeight: 1 }}>{display}</div>
        <Icon size={24} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", transform: "rotate(180deg)", alignSelf: "flex-end" }}>
        <div style={{ fontSize: "16px", lineHeight: 1 }}>{display}</div>
        <Icon size={24} />
      </div>
    </motion.button>
  );
}
