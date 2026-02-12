import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * SOURCE OF TRUTH: MongoDB
 * This model handles persistent user data. 
 * Use this for: Login, Stats, and Profile settings.
 */

// PERSISTENT: Matches 'Player' and 'Stats' from the ER Diagram.
// Lives in MongoDB. Used for long-term tracking and login.

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  profilePhotoURL?: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    totalBidsCast: number;
    totalBidsWon: number;
    totalBidSuccess: number;
  }

  comparePassword: (candidate: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePhotoURL: { type: String, default: "" },
  //Nested Stats object to keep all stats in one place. This allows for easy expansion in the future if we want to add more stats.
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    winLossRatio: { type: Number, default: 0 },
    totalBidsCast: { type: Number, default: 0 },
    totalBidsWon: { type: Number, default: 0 },
    totalBidSuccess: { type: Number, default: 0 },
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
