import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { connectSocket } from "../socket/socket";

export default function Game() {
  const { token } = useAuth();
  const [textMsg, setTextMsg] = useState("Waiting...");

  useEffect(() => {
    if (!token) return;

    setTextMsg(JSON.stringify(token));

    const socket = connectSocket(token);

    socket.on("Message", (msg: string) => {
        setTextMsg(msg);
    })

    socket.on("connect", () => {
      console.log("Connected to game server");
      socket.emit("joinGame", "default-game");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return <><h1>Pitch Game</h1><p>{textMsg}</p></>;
}
