import mongoose from "mongoose";
import { UserModel } from "../model/user.model";
import { ProfileModel } from "../model/profile.model";
import { PostModel } from "../model/post.model";
import { Comment } from "../model/comment.model";

export class AccountService {
  async deleteAccount(userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // 1) Find all posts authored by the user (we need the ids for cleanup)
      const posts = await PostModel.find({ author: userObjectId }, { _id: 1 })
        .session(session)
        .lean();

      const postIds = posts.map((p) => p._id);

      // 2) Delete ALL comments on the user's posts (includes other users comments)
      if (postIds.length > 0) {
        await Comment.deleteMany({ post: { $in: postIds } }).session(session);
      }

      // 3) Delete user's comments anywhere (includes replies on other people's posts)
      await Comment.deleteMany({ user: userObjectId }).session(session);

      // 4) Delete the user's posts
      await PostModel.deleteMany({ author: userObjectId }).session(session);

      // 5) Remove user id from likes/savedBy on remaining posts
      await PostModel.updateMany(
        {},
        { $pull: { likes: userObjectId, savedBy: userObjectId } },
        { session }
      );

      // 6) Remove user from followers/following arrays
      await ProfileModel.updateMany(
        {},
        { $pull: { followers: userObjectId, following: userObjectId } },
        { session }
      );

      // 7) Remove the user's postIds from other users' profile arrays (liked/shared/saved)
      if (postIds.length > 0) {
        await ProfileModel.updateMany(
          {},
          {
            $pull: {
              likedPosts: { $in: postIds },
              sharedPosts: { $in: postIds },
              savedPosts: { $in: postIds },
            },
          },
          { session }
        );
      }

      // 8) Delete the user's profile
      await ProfileModel.deleteOne({ user: userObjectId }).session(session);

      // 9) Finally, delete the user
      await UserModel.deleteOne({ _id: userObjectId }).session(session);

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }
}