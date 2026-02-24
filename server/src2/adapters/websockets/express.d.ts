import { IdentityPayload } from "../auth/IdentityPayload";

declare global {
  namespace Express {
    interface Request {
      user?: IdentityPayload; // optional user property
    }
  }
}