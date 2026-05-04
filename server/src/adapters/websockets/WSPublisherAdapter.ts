import GamePublisherPort from "../../ports/IGamePublisherPort";
import {Server} from "socket.io";
import GameState from "../../domain/entities/GameState";
import {PlayerViewResponseDTO} from "../../application/dto/PlayerViewResponseDTO";
import { Player } from "../../domain/entities/Player";

export default class WSPublisherAdapter implements GamePublisherPort {
  private wss: Server;
  
  constructor (wss: Server) {
    this.wss = wss;
  }
  
  publishGameStateToPlayer(playerId: string, playerView: PlayerViewResponseDTO) {
    this.wss.to(`player:${playerId}`).emit("gameStateUpdate",playerView);
  }

  publishGameStateToRoom(gameId: string, gameState: GameState) {
    for (const playerId of gameState.players.map((p:Player) => p.id)) {
        this.publishGameStateToPlayer(playerId, PlayerViewResponseDTO.fromGameState(gameState, playerId));
    }
  }
  
}
