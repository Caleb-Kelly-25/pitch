import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { connectSocket } from "../socket/socket";

export default function Game() {
  const { token } = useAuth();
  const [textMsg, setTextMsg] = useState("Waiting...");
  //useEffect to connect to socket and listen for messages
  useEffect(() => {
    if (!token) return;
    
    setTextMsg(JSON.stringify(token));

    const socket = connectSocket(token);
    // Listen for messages from the server
    socket.on("Message", (msg: string) => {
        setTextMsg(msg);
    })
    // Join the game room once connected
    socket.on("connect", () => {
      console.log("Connected to game server");
      socket.emit("joinGame", "default-game");
    });
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [token]);
  // Display the message recieved from the server
  return <><h1>Pitch Game</h1><p>{"Make options to host game or join a public or private game"}</p></>;
}
