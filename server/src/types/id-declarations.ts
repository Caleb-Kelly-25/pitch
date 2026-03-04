declare const userIdSymbol: unique symbol;
export type UserId = string & { [userIdSymbol]: never };

declare const gameIdSymbol: unique symbol;
export type GameId = string & { [gameIdSymbol]: never };

declare const playerIdSymbol: unique symbol;
export type PlayerId = string & { [playerIdSymbol]: never };

declare const teamIdSymbol: unique symbol;
export type TeamId = string & { [teamIdSymbol]: never };