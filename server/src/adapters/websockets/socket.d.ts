import { DefaultEventsMap } from "socket.io";
import { IdentityPayload } from "../auth/IdentityPayload";

declare module "socket.io" {
  interface Socket {
    user : IdentityPayload;
  }
}
