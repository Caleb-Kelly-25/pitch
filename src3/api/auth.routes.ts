import { Router } from "express";
import { User } from "../models/User";
import { signToken } from "../auth/jwt";

const router = Router();

// --- Signup ---
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    const user = new User({ username, password });
    await user.save();

    const token = signToken({ userId: user._id.toString(), username });
    res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user._id.toString(), username });
    console.log(`User ${username} logged in successfully with token ${token}.`);
    res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
