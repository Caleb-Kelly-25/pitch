import GamePublisherPort from "../../ports/IGamePublisherPort.ts";
import {Server} from "socket.io";
import GameState from "../../entities/GameState.ts";

export default class WSPublisherAdapter implements GamePublisherPort {
  private wss: Server;
  
  constructor (wss: Server) {
    this.wss = wss;
  }
  
  publishGameStateToPlayer(playerId: string, gameState: GameState) {
    this.wss.to(`player:${playerId}`).emit(JSON.stringify({
        type: "gameStateUpdate",
        payload: gameState
      }));
  }
  
  publishGameStateToRoom(gameId: string, gameState: GameState) {
    this.wss.to(`game:${gameId}`).emit(JSON.stringify({
        type: "gameStateUpdate",
        payload: gameState
      }));
  }
  
}
