import { X } from "lucide-react"
import { Info } from "lucide-react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";


const styles: Record<string, React.CSSProperties> = {
  topBar: {
    backgroundColor: "#c9c0b8",
    padding: "18px 16px", 
    display: "flex",
    alignItems: "center",
  },
  homeIcon: {
    fontSize: "22px",
    color: "#3d2b24",
    cursor: "pointer",
    lineHeight: 1,
  },
  additonalBarFormat: {}
}

function wantToLeave(){
  const confirmLeave = window.confirm("Are you sure you want to leave the game? Your progress will be lost.");
  if (confirmLeave) {
    window.history.back();
  }
}

function statBar() {
  //  TODO: Fill in
}

function infoBar() {
  window.open("https://gamerules.com/rules/10-point-pitch/", "_blank");
}

function emptyTopBar(){
  return(
    <div style={styles.topBar}>
      <Info
        size={45}
        color="#c9c0b8"
        style={{cursor: "default"}}
        onClick={undefined}
      />
    </div>
  );
}

function withoutBackBtnTopBar() {
  return(
    <div style={styles.topBar}>
      <ChartNoAxesColumnIncreasing
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer", marginLeft: "auto"}}
        onClick={statBar}
      />
      <Info
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer"}}
        onClick={infoBar}
      />
    </div>
  );
}

function withBackBtnTopBar() {
  return(
    <div style={styles.topBar}>
      <X
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer"}}
        onClick={() => window.history.back()}
      />
      <ChartNoAxesColumnIncreasing
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer", marginLeft: "auto"}}
        onClick={statBar}
      />
      <Info
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer"}}
        onClick={infoBar}
      />
    </div>
  );
}

function withBackBtnTopBarGamePlay() {
  return(
    <div style={styles.topBar}>
      <X
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer"}}
        onClick={wantToLeave}
      />
      <ChartNoAxesColumnIncreasing
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer", marginLeft: "auto"}}
        onClick={statBar}
      />
      <Info
        size={45}
        color="#3d2b24"
        style={{cursor: "pointer"}}
        onClick={infoBar}
      />
    </div>
  );
}
export default function TopBar({varient}: {varient: "empty" | "withBackBtn" | "withoutBackBtn" | "withBackBtnTopBarGamePlay"}){ 
  if (varient === "empty") return emptyTopBar();
  else if (varient === "withBackBtn") return withBackBtnTopBar();
  else if (varient == "withBackBtnTopBarGamePlay") return withBackBtnTopBarGamePlay();
  else return withoutBackBtnTopBar();
}