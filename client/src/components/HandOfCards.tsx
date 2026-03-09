import Card from "./Card";

export default function HandOfCards({cards, count}) {
   // If cards are provided, use them. Otherwise, create an array of nulls with length equal to count.
    const items = cards ?? Array(count).fill(null);

    return (
    <div style={{ position: "relative", height: "140px"}}>
        {items.map((card, index) => (
        <div
            key={index}
            style={{
            position: "absolute",
            left: `${index * 40}px`, // Adjust the overlap by changing the multiplier
            }}
        >
            <Card suit={card?.suit} value={card?.value} faceDown={card?.faceDown} />
        </div>
        ))}
    </div>)
    }
