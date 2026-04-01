import { socket } from "../../sockets/socket";
const API_URL = "http://localhost:3000";
import { connectSocket } from "../../sockets/socket";
import { useGame } from "./useGame";
import {useAuth} from "../auth/useAuth";

export function playCard(suit: string, value: number, gameId: string) {
    console.log("Playing card");
    if (!socket) {
        throw new Error("Socket not connected, can't play card.");
    } else {
        socket?.emit("PlayCardEvent", JSON.stringify({ gameId:gameId, playerId: "", suit:suit, value:value }));
    }
}

export function requestUpdate() {
    if (!socket) {
        throw new Error("Socket not connected, can't request update.");
    } else {
        socket?.emit("requestUpdate");
    }
}

export function placeBid() {

}

export function pickSuit() {
    
}


export async function createGame(gameCode: string, token: string): Promise<string> {
    const res = await fetch(`${API_URL}/api/game/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: gameCode })
    });

    if (res.ok) {
        connectSocket(token);
        return (await res.json()).gameId;
    }
    return "";
}

export async function joinGame(gameCode: string, token: string) {
    const res = await fetch(`${API_URL}/api/game/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: gameCode })
    });

    if (res.ok) {
        connectSocket(token);
    }
}