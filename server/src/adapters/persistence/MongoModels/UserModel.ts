import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt"; // For password hashing
import { User } from "../../../domain/entities/User"; // Import the User entity from the domain layer


// Define the Mongoose Document interface, and Omit the 'id' field since MongoDB uses '_id' by default
export interface IUserDocument extends Omit<User, 'id'>, Document {
    username: string;
    password: string;
    comparePassword(candidate: string): Promise<boolean>;
}

// Create the Mongoose schema for the User model
const UserSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true }, // Map 'id' to MongoDB's '_id'
    username: { type: String, unique: true, required: true },
    email: {type: String, required: true, unique: true},
    password: { type: String, required: true },
    photoUrl: { type: String },
    gameId: { type: String, default: null },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields

    //This tells Mongoose: "Don't create a virtual 'id' field, 
    //because we already made 'id' a real field that maps to '_id'."
    id: false, 
});

// Hash password before saving
UserSchema.pre("save", async function (this: IUserDocument, next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password for login
UserSchema.methods.comparePassword = async function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

// Create and export the Mongoose model for the User
export default mongoose.model<IUserDocument>("User", UserSchema);