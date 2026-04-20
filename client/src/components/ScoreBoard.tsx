import { current } from "@reduxjs/toolkit";
import { useGame } from "../features/game/useGame";


export default function ScoreBoard() {
    const{
        ourScore,
        theirScore,
        ourCurrentHandScore,
        theirCurrentHandScore
    } = useGame();


    return(
        <div className="scoreboard">
            <div className="score-section">
                <div className = "score-label">Game</div>
                <div className = "score-row">
                    <span>Us</span>
                    <span>{ourScore}</span>
                </div>
                <div className = "score-row">
                    <span>Them</span>
                    <span>{theirScore}</span>
                </div>
            </div>
            <div className = "divider"/>

            <div className="score-section">
                <div className = "score-label">Current Hand</div>
                <div className = "score-row">
                    <span>Us</span>
                    <span>{ourCurrentHandScore? ?? 0}</span>
                </div>
                <div className = "score-row">
                    <span>Them</span>
                    <span>{theirCurrentHandScore? ?? 0}</span>
                </div>
            </div>
        </div>  
        );
}