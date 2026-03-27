import { X } from "lucide-react"
import { Settings } from "lucide-react";
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
//  TODO: Fill in
}

function settingsBar() {
//  TODO: Fill in
}

function emptyTopBar(){
    return(<div style={styles.topBar}>
      <Info
          size={45}
          color="#c9c0b8"
          style={{cursor: "default"}}
          onClick={undefined}
         />
    </div>);
}

function withoutBackBtnTopBar() {
    return(<div style={styles.topBar}>
        {/* Will be used to show stats Page*/}
         <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={statBar}
         />
         {/* Will be used to show info Page (Tutorial) */}
        <Info
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={infoBar}
         />
         {/* Will be used to show settings Page*/}
         <Settings
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={settingsBar}
         />
      </div>)
}

function withBackBtnTopBar() {
    return(<div style={styles.topBar}>
        <X
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={() => window.history.back()}
        />
        {/* Will be used to show stats Page*/}
         <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={statBar}
         />
         {/* Will be used to show info Page (Tutorial) */}
        <Info
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={infoBar}
         />
         {/* Will be used to show settings Page*/}
         <Settings
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={settingsBar}
         />
      </div>);
}


function withBackBtnTopBarGamePlay() {
    return(<div style={styles.topBar}>
        <X
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={wantToLeave}
        />
        {/* Will be used to show stats Page*/}
         <ChartNoAxesColumnIncreasing
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={statBar}
         />
         {/* Will be used to show info Page (Tutorial) */}
        <Info
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={infoBar}
         />
         {/* Will be used to show settings Page*/}
         <Settings
          size={45}
          color="#3d2b24"
          style={{cursor: "pointer"}}
          onClick={settingsBar}
         />
      </div>);
}
export default function TopBar({varient}: {varient: "empty" | "withBackBtn" | "withoutBackBtn" | "withBackBtnTopBarGamePlay"}){ 
   
    if (varient === "empty") return emptyTopBar();
    else if (varient === "withBackBtn") return withBackBtnTopBar();
    else if (varient == "withBackBtnTopBarGamePlay") return withBackBtnTopBarGamePlay();
    else return withoutBackBtnTopBar();
}