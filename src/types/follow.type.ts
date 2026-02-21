import mongoose from "mongoose";

export type FollowType = {
    followerId: mongoose.Types.ObjectId;
    followedId: mongoose.Types.ObjectId;
    createdAt?: Date;
};