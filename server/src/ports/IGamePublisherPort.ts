export default interface GamePublisherPort {
  publishGameStateToPlayer(playerId: string, gameState: any): void;
  publishGameStateToRoom(gameId: string, gameState: any): void;
}
