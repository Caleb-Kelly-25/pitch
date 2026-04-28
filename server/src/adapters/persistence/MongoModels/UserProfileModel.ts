import mongoose, { Schema, Document } from "mongoose";
import { UserProfile } from "../../../domain/entities/UserProfile";

export interface IUserProfileDocument extends Omit<UserProfile, 'userId'>, Document {}

const UserProfileSchema: Schema = new Schema({
    _id: { type: String },  // userId
    gamesCompleted: { type: Number, default: 0 },
    gamesWon:       { type: Number, default: 0 },
    cardsPlayed:    { type: Number, default: 0 },
    tricksPlayed:   { type: Number, default: 0 },
    tricksWon:      { type: Number, default: 0 },
    bidsPlayed:     { type: Number, default: 0 },
    bidsWon:        { type: Number, default: 0 },
}, {
    timestamps: true,
    _id: false,
});

// Index supporting the leaderboard sort; descending so MongoDB can serve
// the first N results without a full collection scan.
UserProfileSchema.index({ gamesWon: -1 });

export default mongoose.model<IUserProfileDocument>("UserProfile", UserProfileSchema);
