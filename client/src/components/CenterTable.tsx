import React from "react";
import { AnimatePresence, motion } from "motion/react";
import Card from "./Card";
import type { CardModel } from "../features/game/gameTypes";

interface CenterTableProps {
  top?: CardModel;
  bottom?: CardModel;
  left?: CardModel;
  right?: CardModel;
}

const SCALE = 0.9;
const BASE_W = 120;
const BASE_H = 170;
const GAP = 4;
export const CARD_W = BASE_W * SCALE;  // 108
export const CARD_H = BASE_H * SCALE;  // 153

const TOTAL_W = 3 * CARD_W + 2 * GAP;
const TOTAL_H = 3 * CARD_H + 2 * GAP;

// Absolute pixel position of each slot's top-left corner within the 3×3 grid
const SLOT_POS = {
  top:    { left: CARD_W + GAP,       top: 0              },
  left:   { left: 0,                  top: CARD_H + GAP   },
  right:  { left: 2 * (CARD_W + GAP), top: CARD_H + GAP  },
  bottom: { left: CARD_W + GAP,       top: 2 * (CARD_H + GAP) },
} as const;

const POSITIONS = Object.keys(SLOT_POS) as Array<keyof typeof SLOT_POS>;

const slotBase: React.CSSProperties = {
  position: "absolute",
  width: CARD_W,
  height: CARD_H,
  borderRadius: 12,
  border: "2px dashed rgba(255,255,255,0.2)",
};

export default function CenterTable({ top, bottom, left, right }: CenterTableProps) {
  const cards = { top, bottom, left, right };

  return (
    <div style={{ position: "relative", width: TOTAL_W, height: TOTAL_H, flexShrink: 0 }}>

      {/* Layer 1 — static dashed slots, never animated */}
      {POSITIONS.map(pos => (
        <div key={pos} style={{ ...slotBase, ...SLOT_POS[pos] }} />
      ))}

      {/* Layer 2 — animated played cards, rendered above the slots */}
      <AnimatePresence>
        {POSITIONS.map(pos => {
          const card = cards[pos];
          if (!card) return null;
          return (
            <motion.div
              key={`${card.suit}-${card.value}`}
              layoutId={`card-${card.suit}-${card.value}`}
              style={{
                position: "absolute",
                left: SLOT_POS[pos].left,
                top: SLOT_POS[pos].top,
                transformOrigin: "top left",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: SCALE, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            >
              <Card suit={card.suit} value={card.value} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
