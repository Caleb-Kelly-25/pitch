import {DefaultEventsMap, Server, Socket} from "socket.io"

export function registerJoinGame(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    socket.on("joinGame", (gameId) => {
        socket.join(gameId);
        socket.emit("Message", "Joined game " + gameId);
        socket.to(gameId).emit("Message", `User ${socket.user?.username} has joined the game.`);
    })
}