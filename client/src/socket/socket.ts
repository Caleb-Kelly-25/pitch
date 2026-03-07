import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
console.log("Connecting socket with token: ", token);

  socket = io("http://localhost:3000", {
    auth: { token }
  });

  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not connected");
  return socket;
}

 const { token } = useAuth();
  const [textMsg, setTextMsg] = useState("Waiting...");

  const navigate = useNavigate();

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
