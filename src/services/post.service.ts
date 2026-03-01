import mongoose from "mongoose";
import { ProfileModel } from "../model/profile.model";
import { HttpError } from "../errors/http-error";
import { PostRepository } from "../repository/post.repository";
import { IPost, PostModel } from "../model/post.model";


const postRepo = new PostRepository();

export class PostService {
    async createPost(data: Partial<IPost>, userId: string): Promise<IPost> {
        const isDraft = data.status === "draft";

        const postData: Partial<IPost> = {
            ...data,
            author: new mongoose.Types.ObjectId(userId),
            status: isDraft ? "draft" : "published",      // draft vs published
  visibility: isDraft ? "private" : "public", 
            attachments: data.attachments || [],
        };

        const post = await postRepo.createPost(postData);

        let profile = await ProfileModel.findOne({ user: userId });
        if (!profile) {
            profile = await ProfileModel.create({ 
                user: userId, 
                postsCount: 0, 
                following: [], 
                likedPosts: [], 
                savedPosts: [] 
            });
        }

        if (!isDraft) {
            profile.postsCount = (profile.postsCount ?? 0) + 1;
            await profile.save();
        }

        return post;
    }

    async getMyPosts(userId: string) {

  const profile = await ProfileModel.findOne({ user: userId }).lean();

  const savedIds = profile?.savedPosts?.map(id => id.toString()) || [];
  const likedIds = profile?.likedPosts?.map(id => id.toString()) || [];

  const posts = await PostModel.find({ author: userId })
    .populate("author")
    .sort({ createdAt: -1 })
    .lean();

  return posts.map(post => ({
    ...post,
    isSaved: savedIds.includes(post._id.toString()),
    isLiked: likedIds.includes(post._id.toString())
  }));
}

    async getPostById(postId: string) {
        const post = await postRepo.getPostById(postId);
        if (!post) throw new HttpError("Post not found", 404);
        await postRepo.incrementViews(postId);
        return post;
    }

    async getAllPosts(userId: string, skip = 0, limit = 10) {
  const profile = await ProfileModel.findOne({ user: userId });

  const likedIds = profile?.likedPosts.map(id => id.toString()) ?? [];
  const savedIds = profile?.savedPosts.map(id => id.toString()) ?? [];

  const posts = await postRepo.getAllPosts(skip, limit);

  return posts.map(post => ({
    ...post,
    isLiked: likedIds.includes(post._id.toString()),
    isSaved: savedIds.includes(post._id.toString()),
  }));
}

    async updatePost(postId: string, data: Partial<IPost>, userId: string) {
        const post = await postRepo.getPostById(postId);
        if (!post) throw new HttpError("Post not found", 404);
        if (post.author.toString() !== userId) throw new HttpError("Unauthorized", 403);

        return postRepo.updatePost(postId, {
            ...data,
            attachments: data.attachments ?? [],
        });
    }

    async deletePost(postId: string, userId: string) {
        const post = await postRepo.getPostById(postId);
        if (!post) throw new HttpError("Post not found", 404);
        if (post.author.toString() !== userId) throw new HttpError("Unauthorized", 403);

        await postRepo.deletePost(postId);

        const profile = await ProfileModel.findOne({ user: userId });
        if (profile) {
            profile.postsCount = Math.max(0, (profile.postsCount ?? 1) - 1);
            await profile.save();
        }
    }

    async getDrafts(userId: string) {
        return postRepo.getDrafts(userId);
    }

    async addView(postId: string) {
        await postRepo.incrementViews(postId);
    }


async getSavedPosts(userId: string) {
  const profile = await ProfileModel.findOne({ user: userId }).lean();
  if (!profile) throw new HttpError("Profile not found", 404);

  const savedIds = profile.savedPosts?.map(id => id.toString()) || [];

  const posts = await PostModel.find({ _id: { $in: savedIds } })
    .populate("author")
    .sort({ createdAt: -1 })
    .lean();

  return posts.map(post => ({
    ...post,
    isSaved: true,
    isLiked: profile.likedPosts?.some(id => id.toString() === post._id.toString()) || false
  }));
}

async getLikedPosts(userId: string) {
  const posts = await PostModel.find({ likes: userId })
    .populate("author")
    .sort({ createdAt: -1 });
  return posts;
}

    // --- Likes / Saves / Shares ---
   async toggleLike(postId: string, userId: string) {
    const profile = await ProfileModel.findOne({ user: userId });
    if (!profile) throw new HttpError("Profile not found", 404);

    const post = await PostModel.findById(postId);
    if (!post) throw new HttpError("Post not found", 404);

    const alreadyLiked = profile.likedPosts?.some(id => id.toString() === postId);

    if (alreadyLiked) {
        profile.likedPosts = profile.likedPosts.filter(id => id.toString() !== postId);
        post.likes = post.likes?.filter(id => id.toString() !== userId) ?? [];
        post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
        profile.likedPosts.push(post._id);
        post.likes = [...(post.likes ?? []), new mongoose.Types.ObjectId(userId)];
        post.likesCount += 1;
    }

    await profile.save();
    await post.save();

    return post;
}

async toggleSave(postId: string, userId: string) {

  const profile = await ProfileModel.findOne({ user: userId });
  if (!profile) throw new HttpError("Profile not found", 404);

  const post = await PostModel.findById(postId);
  if (!post) throw new HttpError("Post not found", 404);

  if (!profile.savedPosts) profile.savedPosts = [];
  if (!post.savedBy) post.savedBy = [];

  const alreadySaved = profile.savedPosts.some(id => id.toString() === postId);

  if (alreadySaved) {
    // remove from profile
    profile.savedPosts = profile.savedPosts.filter(
      id => id.toString() !== postId
    );

    // remove from post
    post.savedBy = post.savedBy.filter(
      id => id.toString() !== userId
    );

    post.savesCount = Math.max(0, (post.savesCount || 0) - 1);

  } else {
    // add to profile
    profile.savedPosts.push(post._id);

    // add to post
    post.savedBy.push(new mongoose.Types.ObjectId(userId));

    post.savesCount = (post.savesCount || 0) + 1;
  }

  await profile.save();
  await post.save();

  return post;
}

    async addShare(postId: string) {
        await postRepo.incrementShares(postId);
    }

    // --- Feeds ---
    // In postService
async getFeed(userId: string, lastCreatedAt?: string, limit = 10) {
  const filter: any = {
    isDraft: false,        // exclude drafts
    visibility: 'public', 
  };

  if (lastCreatedAt) {
    filter.createdAt = { $lt: new Date(lastCreatedAt) };
  }

  const posts = await PostModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return posts;
}

    async getRankedFeed(userId: string, skip = 0, limit = 10) {
        console.log("User ID for feed:", userId);
        const profile = await ProfileModel.findOne({ user: userId });
        console.log("Profile found:", profile);
        if (!profile) throw new HttpError("Profile not found", 404);

        const followingIds = (profile.following ?? []).map(id => id.toString());
        console.log("Following IDs:", followingIds);
        return postRepo.getRankedFeedPosts(followingIds, skip, limit);
    }
}
