import mongoose from "mongoose";
import { createClient } from "redis";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/pitch";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";


export const pubClient = createClient({ url: REDIS_URL }); //sends out messages to channels
export const subClient = pubClient.duplicate(); //listens to messages from channels
export const storageClient = pubClient.duplicate(); //stores game state data in Redis



export async function bootstrap() {
  if (process.env.MONGO_URI) {
    await mongoose
      .connect(MONGO_URI, {
        dbName: "pitch",
        tls: true,
        tlsCAFile: "/app/rds-ca-bundle.pem",   // Ensure this file exists in the container
        authSource: "admin",                    // DocumentDB authenticates against the admin db
        authMechanism: "SCRAM-SHA-1"            // Force SCRAM-SHA-1
      })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => { console.error("MongoDB connection error:", err); throw err; });
  } else {
    await mongoose.connect(MONGO_URI, { dbName: "pitch"})
      .then(() => console.log("MongoDB connected"))
      .catch((err) => { console.error("MongoDB connection error:", err); throw err; });
  }

  await pubClient.connect();
  await subClient.connect();
  await storageClient.connect();

  console.log("Redis connected");
}