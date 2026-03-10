import Card from "./Card";

export default function HandOfCards({cards, count, overlap = 40}) {
   const items = cards ?? Array(count).fill({ faceDown: true });
   const totalWidth = 120 + (items.length - 1) * overlap;

    return (
    <div style={{ position: "relative", height: "170px", width: `${totalWidth}px`, flexShrink: 0 }}>
        {items.map((card, index) => (
        <div
            key={index}
            style={{
            position: "absolute",
            left: `${index * overlap}px`,
            }}
        >
            <Card suit={card?.suit} value={card?.value} faceDown={card?.faceDown} />
        </div>
        ))}
    </div>)
    }