import mongoose from "mongoose";
import { UserModel } from "../model/user.model";
import { ProfileModel } from "../model/profile.model";
import { PostModel } from "../model/post.model";
import { Comment } from "../model/comment.model";
import { FollowModel } from "../model/follow.model";
import { BookModel } from "../model/book.model";
import { ChatModel } from "../model/chat.model";

export class AccountService {
  async deleteAccount(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ---------------- Books ----------------
    // 1) Delete all books authored by the user
    await BookModel.deleteMany({ author: userObjectId });

    // Also remove user from sharedWith arrays (in case other people's books were shared with them)
    await BookModel.updateMany(
      { sharedWith: userObjectId },
      { $pull: { sharedWith: userObjectId } }
    );

    // ---------------- Chats (your ChatModel == messages) ----------------
    // 2) Delete all chat messages where user is sender or receiver
    await ChatModel.deleteMany({
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
    });

    // ---------------- Follow relationships ----------------
    // 3) Delete follow docs involving this user
    await FollowModel.deleteMany({
      $or: [{ followerId: userObjectId }, { followedId: userObjectId }],
    });

    // ---------------- Posts + Comments ----------------
    // 4) Find posts authored by user (need ids)
    const posts = await PostModel.find({ author: userObjectId }, { _id: 1 }).lean();
    const postIds = posts.map((p) => p._id);

    // 5) Delete comments on the user's posts (everyone's)
    if (postIds.length > 0) {
      await Comment.deleteMany({ post: { $in: postIds } });
    }

    // 6) Delete user's comments anywhere (including replies on other people's posts)
    await Comment.deleteMany({ user: userObjectId });

    // 7) Delete user's posts
    await PostModel.deleteMany({ author: userObjectId });

    // 8) Remove user id from likes/savedBy arrays on remaining posts
    await PostModel.updateMany({}, { $pull: { likes: userObjectId, savedBy: userObjectId } });

    // ---------------- Profile cleanup ----------------
    // 9) Remove user from followers/following arrays in all profiles
    await ProfileModel.updateMany({}, { $pull: { followers: userObjectId, following: userObjectId } });

    // 10) Remove deleted posts from liked/shared/saved arrays
    if (postIds.length > 0) {
      await ProfileModel.updateMany(
        {},
        {
          $pull: {
            likedPosts: { $in: postIds },
            sharedPosts: { $in: postIds },
            savedPosts: { $in: postIds },
          },
        }
      );
    }

    // 11) Delete user's profile
    await ProfileModel.deleteOne({ user: userObjectId });

    // ---------------- Finally: delete user ----------------
    await UserModel.deleteOne({ _id: userObjectId });
  }
}