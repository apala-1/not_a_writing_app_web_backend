import { FollowModel } from "../model/follow.model";
import { UserModel } from "../model/user.model";
import { FollowRepository } from "../repository/follow.repository";

const followRepo = new FollowRepository();

export class FollowService {
    async follow(userId: string, targetUserId: string) {
        if (userId === targetUserId) throw new Error("Cannot follow yourself");

        const alreadyFollowing = await followRepo.exists(userId, targetUserId);
        if (alreadyFollowing) throw new Error("Already following");

        return followRepo.createFollow(userId, targetUserId);
    }

    async unfollow(userId: string, targetUserId: string) {
        const result = await followRepo.removeFollow(userId, targetUserId);
        if (!result.deletedCount) throw new Error("Not following or already removed");
        return { success: true };
    }

    async searchUsers(query: string) {
  return UserModel.find({
    name: { $regex: query, $options: "i" },
  }).select("-password");
}

    async getFollowers(userId: string) {
  const followers = await FollowModel.find({ followedId: userId })
    .populate("followerId", "-password");

  return followers.map(f => f.followerId);
}

    async getFollowing(userId: string) {
        return followRepo.getFollowing(userId);
    }

    async canMessage(userA: string, userB: string) {
        return followRepo.isMutual(userA, userB);
    }

    async isFollowing(followerId: string, followedId: string): Promise<boolean> {
        return followRepo.exists(followerId, followedId);
    }
    async getCounts(userId: string) {
        return followRepo.count(userId);
    }
    async getMutuals(userId: string) {
  // 1️⃣ Users I follow
  const following = await FollowModel.find({
    followerId: userId,
  }).select("followedId");

  const followingIds = following.map(f =>
    f.followedId.toString()
  );

  // 2️⃣ Users who follow me
  const followers = await FollowModel.find({
    followedId: userId,
    followerId: { $in: followingIds },
  }).populate("followerId", "-password");

  // 3️⃣ Return populated user objects
  return followers.map(f => f.followerId);
}
}