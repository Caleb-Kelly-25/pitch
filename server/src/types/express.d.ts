import { IUserPayload } from "./auth"; // optional, JWT payload type

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload; // optional user property
    }
  }
}
