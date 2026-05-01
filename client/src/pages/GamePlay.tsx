import { LayoutGroup } from "motion/react"
import TopBar from "../components/TopBar"
import SoundEngine from "../components/SoundEngine"
import AmbientMusic from "../components/AmbientMusic"
import ScoreStrip from "../components/ScoreStrip"
import TakenCardsStrip from "../components/TakenCardsStrip"
import TrickResultOverlay from "../components/TrickResultOverlay"
import HandResultOverlay from "../components/HandResultOverlay"
import PhaseDisplay from "../components/PhaseDisplay"
import { EmberParticles, FloatingSuits } from "../components/Particles"
import "./GamePlay.css"
import styles from "./GamePlay.module.css"

export default function GamePlay() {
  return (
    <LayoutGroup id="game-cards">
      <div className={styles.wrapper}>
        <SoundEngine />
        <AmbientMusic />
        <FloatingSuits />
        <EmberParticles />
        <TopBar variant="gameplay" />
        <ScoreStrip />
        <TakenCardsStrip />
        <PhaseDisplay />
        <TrickResultOverlay />
        <HandResultOverlay />
      </div>
    </LayoutGroup>
  )
}
