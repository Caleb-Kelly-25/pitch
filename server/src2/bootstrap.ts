import mongoose from "mongoose";
import { createClient } from "redis";

export const pubClient = createClient({ url: process.env.REDIS_URL });
export const subClient = pubClient.duplicate();

export async function bootstrap() {
  mongoose
  .connect(process.env.MONGO_URI!, { dbName: "pitch" })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  await pubClient.connect();
  await subClient.connect();
}