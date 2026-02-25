import { IdentityPayload } from "./IdentityPayload";

export default interface IAuthAdapter {
    signToken(userId: string): string;
    verifyToken(token: string): IdentityPayload;
}