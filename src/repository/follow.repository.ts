import { IFollow, FollowModel } from "../model/follow.model";
import mongoose from "mongoose";

export class FollowRepository {
    async createFollow(followerId: string, followedId: string): Promise<IFollow> {
        return FollowModel.create({ followerId: new mongoose.Types.ObjectId(followerId), followedId: new mongoose.Types.ObjectId(followedId) });
    }

    async removeFollow(followerId: string, followedId: string): Promise<{ deletedCount?: number }> {
        return FollowModel.deleteOne({ followerId, followedId });
    }

    async exists(followerId: string, followedId: string): Promise<boolean> {
      const follow = await FollowModel.findOne({
        followerId,
        followedId,
      });

      return !!follow;
    }

    async getFollowers(userId: string): Promise<IFollow[]> {
        return FollowModel.find({ followedId: userId }).populate("followerId", "-password").exec();
    }

    async getFollowing(userId: string): Promise<IFollow[]> {
        return FollowModel.find({ followerId: userId }).populate("followedId", "-password").exec();
    }

    async isMutual(userA: string, userB: string): Promise<boolean> {
        const aFollowsB = await this.exists(userA, userB);
        const bFollowsA = await this.exists(userB, userA);
        return aFollowsB && bFollowsA;
    }
    async count(userId: string) {
      const followers = await FollowModel.countDocuments({
        followedId: userId,
      });

      const following = await FollowModel.countDocuments({
        followerId: userId,
      });

      return { followers, following };
    }
}