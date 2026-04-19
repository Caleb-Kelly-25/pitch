import { X, Info, ChartNoAxesColumnIncreasing } from "lucide-react"

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    backgroundColor: "#c9c0b8",
    padding: "18px 16px",
    display: "flex",
    alignItems: "center",
  },
}

function wantToLeave() {
  const confirmLeave = window.confirm("Are you sure you want to leave the game? Your progress will be lost.")
  if (confirmLeave) {
    window.history.back()
  }
}

function infoBar() {
  window.open("https://gamerules.com/rules/10-point-pitch/", "_blank")
}

type TopBarVariant = "empty" | "withBackBtn" | "withoutBackBtn" | "gameplay"

export default function TopBar({ variant }: { variant: TopBarVariant }) {
  if (variant === "empty") {
    return (
      <div style={styles.topBar}>
        <Info size={45} color="#c9c0b8" style={{ cursor: "default" }} />
      </div>
    )
  }

  if (variant === "withBackBtn") {
    return (
      <div style={styles.topBar}>
        <X
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer" }}
          onClick={() => window.history.back()}
        />
        <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer", marginLeft: "auto" }}
        />
        <Info
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer" }}
          onClick={infoBar}
        />
      </div>
    )
  }

  if (variant === "gameplay") {
    return (
      <div style={styles.topBar}>
        <X
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer" }}
          onClick={wantToLeave}
        />
        <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer", marginLeft: "auto" }}
        />
        <Info
          size={45}
          color="#3d2b24"
          style={{ cursor: "pointer" }}
          onClick={infoBar}
        />
      </div>
    )
  }

  // withoutBackBtn (default)
  return (
    <div style={styles.topBar}>
      <ChartNoAxesColumnIncreasing
        size={45}
        color="#3d2b24"
        style={{ cursor: "pointer", marginLeft: "auto" }}
      />
      <Info
        size={45}
        color="#3d2b24"
        style={{ cursor: "pointer" }}
        onClick={infoBar}
      />
    </div>
  )
}
