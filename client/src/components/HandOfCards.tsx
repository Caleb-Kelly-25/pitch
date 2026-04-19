import type {CardProps} from "./Card";
import Card from "./Card";

export default function HandOfCards({cards, count, overlap = 40}: { cards?: CardProps[]; count: number; overlap?: number }) {
   const items = cards ?? Array(count).fill({ faceDown: true });
   const totalWidth = 120 + (items.length - 1) * overlap;

    return (
    <div style={{ position: "relative", height: "170px", width: `${totalWidth}px`, flexShrink: 0 }}>
        {items.map((card: CardProps, index) => (
        <div
            key={index}
            style={{
            position: "absolute",
            left: `${index * overlap}px`,
            }}
        >
            <Card suit={card?.suit} value={card?.value} faceDown={card?.faceDown} highlighted={card?.highlighted} dimmed={card?.dimmed} onClick={card?.onClick} />
        </div>
        ))}
    </div>)
}