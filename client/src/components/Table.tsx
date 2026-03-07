

const styles: Record<string, React.CSSProperties> = {
    table: {
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
},
playerTop: {
    position: "absolute",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
},
playerBottom: {
    position: "absolute",
    bottom: "10%",
    left: "50%",
    transform: "translateX(-50%)",
},
playerLeft: {
    position: "absolute",
    top: "50%",
    left: "10%",
    transform: "translateY(-50%)",
},
playerRight: {
    position: "absolute",
    top: "50%",
    right: "10%",
    transform: "translateY(-50%)",
},
}

export default function Table({ children }) {
    return (
    <div style={styles.table}>
      {children}
    </div>
  );
}
