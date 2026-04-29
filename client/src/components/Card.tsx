import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, Diamond, Club, Spade } from "lucide-react";
import JokerImage from "../assets/Bob_Headshot.jpg";
import BackOfCard from "../assets/BackOfCard.png";

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
