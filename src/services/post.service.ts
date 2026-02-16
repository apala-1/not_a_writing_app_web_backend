import mongoose from "mongoose";
import { ProfileModel } from "../model/profile.model";
import { HttpError } from "../errors/http-error";
import { PostRepository } from "../repository/post.repository";
import { IPost } from "../model/post.model";


const postRepo = new PostRepository();

export class PostService {
    async createPost(data: Partial<IPost>, userId: string): Promise<IPost> {
        const postData: Partial<IPost> = { ...data, author: new mongoose.Types.ObjectId(userId) };
        const post = await postRepo.createPost(postData);

        let profile = await ProfileModel.findOne({ user: userId });
        if (!profile) {
            profile = await ProfileModel.create({ user: userId, postsCount: 0, following: [], likedPosts: [], savedPosts: [] });
        }
        profile.postsCount = (profile.postsCount ?? 0) + 1;
        await profile.save();

        return post;
    }

    async getPostById(postId: string) {
        const post = await postRepo.getPostById(postId);
        if (!post) throw new HttpError("Post not found", 404);
        await postRepo.incrementViews(postId);
        return post;
    }

    async getAllPosts(skip = 0, limit = 10) {
        return postRepo.getAllPosts(skip, limit);
    }

    async updatePost(postId: string, data: Partial<IPost>, userId: string) {
        const post = await postRepo.getPostById(postId);
        if (!post) throw new HttpError("Post not found", 404);
        if (post.author.toString() !== userId) throw new HttpError("Unauthorized", 403);

        return postRepo.updatePost(postId, data);
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

    // --- Likes / Saves / Shares ---
    async toggleLike(postId: string, userId: string): Promise<"liked" | "unliked"> {
        const profile = await ProfileModel.findOne({ user: userId });
        if (!profile) throw new HttpError("Profile not found", 404);

        const alreadyLiked = profile.likedPosts?.some(id => id.toString() === postId);
        if (alreadyLiked) {
            profile.likedPosts = profile.likedPosts.filter(id => id.toString() !== postId);
            await postRepo.decrementLikes(postId);
            await profile.save();
            return "unliked";
        } else {
            profile.likedPosts = [...(profile.likedPosts ?? []), new mongoose.Types.ObjectId(postId)];
            await postRepo.incrementLikes(postId);
            await profile.save();
            return "liked";
        }
    }

    async toggleSave(postId: string, userId: string): Promise<"saved" | "unsaved"> {
        const profile = await ProfileModel.findOne({ user: userId });
        if (!profile) throw new HttpError("Profile not found", 404);

        const alreadySaved = profile.savedPosts?.some(id => id.toString() === postId);
        if (alreadySaved) {
            profile.savedPosts = profile.savedPosts.filter(id => id.toString() !== postId);
            await postRepo.decrementSaves(postId);
            await profile.save();
            return "unsaved";
        } else {
            profile.savedPosts = [...(profile.savedPosts ?? []), new mongoose.Types.ObjectId(postId)];
            await postRepo.incrementSaves(postId);
            await profile.save();
            return "saved";
        }
    }

    async addShare(postId: string) {
        await postRepo.incrementShares(postId);
    }

    // --- Feeds ---
    async getFeed(userId: string, lastCreatedAt?: string, limit = 10) {
        const profile = await ProfileModel.findOne({ user: userId });
        if (!profile) throw new HttpError("Profile not found", 404);

        // map ObjectIds to strings
        const followingIds = (profile.following ?? []).map(id => id.toString());

        return postRepo.getFeedPosts(followingIds, lastCreatedAt, limit);
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
