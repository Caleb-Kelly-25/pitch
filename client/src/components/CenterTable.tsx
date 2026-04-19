import Card from "./Card"
import type { CardModel } from "../features/game/gameTypes"

interface CenterTableProps {
  top?: CardModel
  bottom?: CardModel
  left?: CardModel
  right?: CardModel
}

const SCALE = 0.9
const BASE_W = 120
const BASE_H = 170
const GAP = 4
const CARD_W = BASE_W * SCALE
const CARD_H = BASE_H * SCALE

const slotStyle: React.CSSProperties = {
  width: `${CARD_W}px`,
  height: `${CARD_H}px`,
  borderRadius: "12px",
  border: "2px dashed rgba(255,255,255,0.2)",
}

const cardWrapStyle: React.CSSProperties = {
  width: `${CARD_W}px`,
  height: `${CARD_H}px`,
  overflow: "hidden",
  borderRadius: "12px",
  flexShrink: 0,
}

function ScaledCard({ suit, value }: CardModel) {
  return (
    <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
      <Card suit={suit} value={value} />
    </div>
  )
}

export default function CenterTable({ top, bottom, left, right }: CenterTableProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${CARD_W}px ${CARD_W}px ${CARD_W}px`,
        gridTemplateRows: `${CARD_H}px ${CARD_H}px ${CARD_H}px`,
        gap: `${GAP}px`,
      }}
    >
      <div style={{ gridColumn: 2, gridRow: 1, ...cardWrapStyle }}>
        {top ? <ScaledCard {...top} /> : <div style={slotStyle} />}
      </div>
      <div style={{ gridColumn: 1, gridRow: 2, ...cardWrapStyle }}>
        {left ? <ScaledCard {...left} /> : <div style={slotStyle} />}
      </div>
      <div style={{ gridColumn: 3, gridRow: 2, ...cardWrapStyle }}>
        {right ? <ScaledCard {...right} /> : <div style={slotStyle} />}
      </div>
      <div style={{ gridColumn: 2, gridRow: 3, ...cardWrapStyle }}>
        {bottom ? <ScaledCard {...bottom} /> : <div style={slotStyle} />}
      </div>
    </div>
  )
}
