import IAuthAdapter from "./IAuthAdapter";
import jwt from "jsonwebtoken";
import { IdentityPayload } from "./IdentityPayload";

const JWT_EXPIRES_IN = "30m";

export default class JwtAuthAdapter implements IAuthAdapter {
    signToken(userId: string, username: string): string {
        return jwt.sign({ userId: userId, username: username}, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
    }

    verifyToken(token: string): IdentityPayload {
        token = token.replace("Bearer ","");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return typeof decoded === "object" && decoded !== null && "userId" in decoded ? decoded as IdentityPayload : (() => { throw new Error("Invalid token payload"); })();
    }
}
