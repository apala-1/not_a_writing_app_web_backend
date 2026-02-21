import mongoose from "mongoose";
import { UserType } from "./user.type";

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


export type PopulatedProfileType = {
  user: UserType & { _id: mongoose.Types.ObjectId };
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  postsCount: number;
  booksCount: number;
  likedPosts: mongoose.Types.ObjectId[];
  sharedPosts: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
};