import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "30m";

export function signToken(payload: { userId: string; username: string }) {
    console.log("Signing token for payload:", payload);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
    console.log("Verifying token:", token);
  return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
}
