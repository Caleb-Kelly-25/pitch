import HandOfCards from "../components/HandOfCards";
import Table from "../components/Table";
import TopBar from "../components/TopBar";
import PlayerSeat from "../components/PlayerSeat";

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    backgroundColor: "#7d2a2a",
    position: "fixed" as const,
    top: 0,
    left: 0,
    overflow: "hidden",
  },
};

export default function GamePlay() {
  return (
    <div style={styles.wrapper}>
      <TopBar varient="withBackBtn" />

      <Table
        top={{ suit: "HEARTS", value: 3}}
        bottom={{ suit: "HEARTS", value: 1 }}
        left={{ suit: "HEARTS", value: 4 }}
        right={{ suit: "HEARTS", value: 9 }}
      >
        <PlayerSeat position="top">
          <HandOfCards count={5} />
        </PlayerSeat>

        <PlayerSeat position="left">
          <HandOfCards count={5} />
        </PlayerSeat>

        <PlayerSeat position="right">
          <HandOfCards count={5} />
        </PlayerSeat>

        <PlayerSeat position="bottom">
          <HandOfCards
            overlap={110}
            cards={[
              { suit: "HEARTS", value: 14 },
              { suit: "SPADES", value: 13 },
              { suit: "DIAMONDS", value: 10 },
              { suit: "CLUBS", value: 7 },
              { suit: "HEARTS", value: 13 },
            ]}
          />
        </PlayerSeat>
      </Table>
    </div>
  );
}