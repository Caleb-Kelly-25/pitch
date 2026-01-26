import cors from "cors"
import express from "express";
import authRoutes from "./api/auth.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
