import { ProfileRepository } from "../repository/profile.repository";
import { IProfile } from "../model/profile.model";

const profileRepo = new ProfileRepository();

export class ProfileService {
  async createProfile(userId: string): Promise<IProfile> {
    return profileRepo.createProfile(userId);
  }

  async getProfile(userId: string): Promise<IProfile> {
    const profile = await profileRepo.findByUserId(userId);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  async follow(userId: string, targetUserId: string): Promise<IProfile> {
  if (userId === targetUserId) throw new Error("Cannot follow yourself");

  await profileRepo.addFollower(targetUserId, userId);

  const updated = await profileRepo.addFollowing(userId, targetUserId);
  if (!updated) throw new Error("Profile not found");

  return updated;
}


  async unfollow(userId: string, targetUserId: string): Promise<IProfile> {
  await profileRepo.removeFollower(targetUserId, userId);

  const updated = await profileRepo.removeFollowing(userId, targetUserId);
  if (!updated) throw new Error("Profile not found");

  return updated;
}


 async addPostAction(
  userId: string,
  postId: string,
  action: "like" | "share" | "comment" | "save"
): Promise<IProfile> {
  const updated = await profileRepo.addPostAction(userId, postId, action);
  if (!updated) throw new Error("Profile not found");

  return updated;
}


  async updateCounts(
  userId: string,
  postsCount?: number,
  booksCount?: number
): Promise<IProfile> {
  const updated = await profileRepo.updateCounts(userId, postsCount, booksCount);
  if (!updated) throw new Error("Profile not found");

  return updated;
}

}
