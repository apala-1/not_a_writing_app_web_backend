import { ProfileRepository } from "../repository/profile.repository";
import { PostRepository } from "../repository/post.repository";
import { IProfile } from "../model/profile.model";

const profileRepo = new ProfileRepository();
const postRepo = new PostRepository();

export class ProfileService {
  async createProfile(userId: string): Promise<IProfile> {
    return profileRepo.createProfile(userId);
  }

  async getProfile(userId: string): Promise<IProfile> {
    const profile = await profileRepo.findByUserId(userId);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  async findProfile(userId: string): Promise<IProfile | null> {
  return profileRepo.findByUserId(userId);
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
  action: "like" | "share" | "save"
): Promise<IProfile> {

  const updated = await profileRepo.addPostAction(userId, postId, action);
  if (!updated) throw new Error("Profile not found");

  if (action === "like") {
    await postRepo.incrementLikes(postId);
  }

  if (action === "share") {
    await postRepo.incrementShares(postId);
  }

  if (action === "save") {
  await postRepo.incrementSaves(postId);
}

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
