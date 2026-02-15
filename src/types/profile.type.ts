import mongoose from "mongoose";

export type ProfileType = {
    user: mongoose.Types.ObjectId;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    postsCount: number;
    booksCount: number;
    likedPosts: mongoose.Types.ObjectId[];
    sharedPosts: mongoose.Types.ObjectId[];
    savedPosts: mongoose.Types.ObjectId[];
};