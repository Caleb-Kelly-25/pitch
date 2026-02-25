import { Socket } from "socket.io";
import IAuthAdapter from "./IAuthAdapter";
import jwt from "jsonwebtoken";
import { IdentityPayload } from "./IdentityPayload";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "30m";

export default class JwtAuthAdapter implements IAuthAdapter {
    signToken(userId: string): string {
        console.log("Signing token for userId:", userId);
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    verifyToken(token: string): IdentityPayload {
        
        const decoded = jwt.verify(token, JWT_SECRET);
        return typeof decoded === "object" && decoded !== null && "userId" in decoded ? decoded as IdentityPayload : (() => { throw new Error("Invalid token payload"); })();
        
    }
}
