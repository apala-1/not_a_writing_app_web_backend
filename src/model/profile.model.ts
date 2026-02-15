import mongoose, { Document, Schema } from "mongoose";
import { ProfileType } from "../types/profile.type";

const ProfileSchema = new Schema<IProfile>(
    {
        user: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
        followers: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
        following: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
        postsCount: { type: Number, default: 0 },
        booksCount: { type: Number, default: 0 },
        likedPosts: [{ type: mongoose.Types.ObjectId, ref: "Post", default: [] }],
        sharedPosts: [{ type: mongoose.Types.ObjectId, ref: "Post", default: [] }],
        savedPosts: [{ type: mongoose.Types.ObjectId, ref: "Post", default: [] }],
    },
    { timestamps: true }
);

export interface IProfile extends ProfileType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const ProfileModel = mongoose.model<IProfile>("Profile", ProfileSchema);