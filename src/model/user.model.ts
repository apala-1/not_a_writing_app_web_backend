import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true, minlength: 5 },
        password: { type: String, required: true, minlength: 8 },
        username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
        firstName: { type: String },
        lastName: { type: String },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);