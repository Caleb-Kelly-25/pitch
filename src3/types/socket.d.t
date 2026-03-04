import { DefaultEventsMap } from "socket.io";
import { JwtPayload } from "./auth";

declare module "socket.io" {
  interface Socket<
    ListenEvents = DefaultEventsMap,
    EmitEvents = DefaultEventsMap,
    ServerSideEvents = DefaultEventsMap,
    SocketData = any
  > {
    user : JwtPayload;
  }
}
