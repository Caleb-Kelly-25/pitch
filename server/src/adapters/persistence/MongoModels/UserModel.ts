import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../../../domain/entities/User";

export interface IUserDocument extends Omit<User, 'id'>, Document {
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    _id: { type: String },
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    photoUrl: { type: String, default: null },
    gameId: { type: String, default: null },
}, {
    timestamps: true,
    _id: false,
});

UserSchema.pre("save", async function (this: IUserDocument) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUserDocument>("User", UserSchema);
