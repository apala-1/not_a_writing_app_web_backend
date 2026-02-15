import { ProfileModel, IProfile } from "../model/profile.model";
import mongoose from "mongoose";

export class ProfileRepository {
  async createProfile(userId: string): Promise<IProfile> {
    const profile = new ProfileModel({ user: new mongoose.Types.ObjectId(userId) });
    return await profile.save();
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return ProfileModel.findOne({ user: userId }).populate("followers following").exec();
  }

  async addFollower(userId: string, followerId: string): Promise<IProfile | null> {
    return ProfileModel.findOneAndUpdate(
      { user: userId },
      { $addToSet: { followers: followerId } },
      { new: true }
    ).exec();
  }

  async removeFollower(userId: string, followerId: string): Promise<IProfile | null> {
    return ProfileModel.findOneAndUpdate(
      { user: userId },
      { $pull: { followers: followerId } },
      { new: true }
    ).exec();
  }

  async addFollowing(userId: string, followingId: string): Promise<IProfile | null> {
    return ProfileModel.findOneAndUpdate(
      { user: userId },
      { $addToSet: { following: followingId } },
      { new: true }
    ).exec();
  }

  async removeFollowing(userId: string, followingId: string): Promise<IProfile | null> {
    return ProfileModel.findOneAndUpdate(
      { user: userId },
      { $pull: { following: followingId } },
      { new: true }
    ).exec();
  }

  async updateCounts(userId: string, postsCount?: number, booksCount?: number): Promise<IProfile | null> {
    const update: any = {};
    if (postsCount !== undefined) update.postsCount = postsCount;
    if (booksCount !== undefined) update.booksCount = booksCount;
    return ProfileModel.findOneAndUpdate({ user: userId }, update, { new: true }).exec();
  }

  async addPostAction(userId: string, postId: string, action: string) {
  const updateField =
    action === "like"
      ? { likedPosts: postId }
      : action === "share"
      ? { sharedPosts: postId }
      : action === "save"
      ? { savedPosts: postId }
      : null;

  if (!updateField) throw new Error("Invalid action");

  return ProfileModel.findOneAndUpdate(
    { user: userId },
    { $addToSet: updateField },
    { new: true }
  );
}

}
