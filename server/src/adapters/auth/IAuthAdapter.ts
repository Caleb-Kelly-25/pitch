import { IdentityPayload } from "./IdentityPayload";

export default interface IAuthAdapter {
    signToken(userId: string, username: string): string;
    verifyToken(token: string): IdentityPayload;
}