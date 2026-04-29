import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import type { CardProps } from "./Card";
import Card from "./Card";

interface HandOfCardsProps {
  cards?: CardProps[];
  count: number;
  overlap?: number;
  active?: boolean;
}

export default function HandOfCards({ cards, count, overlap = 40, active = false }: HandOfCardsProps) {
  const items: CardProps[] = cards ?? Array.from({ length: count }, () => ({ faceDown: true }));
  const N = items.length;
  if (N === 0) return null;

  const mid = (N - 1) / 2;
  const spread = Math.max(3, 9 - N * 0.5) * (active ? 1.35 : 1);
  const effectiveOverlap = active ? overlap + 14 : overlap;
  const liftY = active ? -18 : 0;
  const totalWidth = 120 + (N - 1) * effectiveOverlap;

  return (
    <div style={{ position: "relative", height: "200px", width: `${totalWidth}px`, flexShrink: 0 }}>
      <AnimatePresence initial={false}>
        {items.map((card, i) => {
          const angle = (i - mid) * spread;
          const arcY = Math.pow(Math.abs(i - mid), 1.2) * 3;
          const baseY = arcY + liftY;
          const layoutId = card.suit && card.value != null && !card.faceDown
            ? `card-${card.suit}-${card.value}`
            : undefined;

          return (
            <motion.div
              key={layoutId ?? `face-down-${i}`}
              layoutId={layoutId}
              layout
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: baseY, rotate: angle, opacity: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.85 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                delay: i * 0.04,
              }}
              whileHover={{ zIndex: 50, y: baseY - 6 }}
              style={{
                position: "absolute",
                left: `${i * effectiveOverlap}px`,
                bottom: 0,
                zIndex: i,
                transformOrigin: "bottom center",
              }}
            >
              <Card
                suit={card.suit}
                value={card.value}
                faceDown={card.faceDown}
                highlighted={card.highlighted}
                dimmed={card.dimmed}
                onClick={card.onClick}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
