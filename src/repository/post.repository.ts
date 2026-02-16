import { IPost, PostModel } from "../model/post.model";
import { ProfileModel } from "../model/profile.model";
import mongoose from "mongoose";

export interface IPostRepository {
    createPost(postData: Partial<IPost>): Promise<IPost>;
    getPostById(id: string): Promise<IPost | null>;
    getAllPosts(skip: number, limit: number): Promise<IPost[]>;
    updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null>;
    deletePost(id: string): Promise<boolean>;
    getDrafts(userId: string): Promise<IPost[]>;
    incrementViews(postId: string): Promise<IPost | null>;
    incrementLikes(postId: string): Promise<IPost | null>;
    decrementLikes(postId: string): Promise<IPost | null>;
    incrementSaves(postId: string): Promise<IPost | null>;
    decrementSaves(postId: string): Promise<IPost | null>;
    incrementShares(postId: string): Promise<IPost | null>;
    getFeedPosts(followingIds: string[], lastCreatedAt?: string, limit?: number): Promise<IPost[]>;
    getRankedFeedPosts(followingIds: string[], skip?: number, limit?: number): Promise<any[]>;
}

export class PostRepository implements IPostRepository {
    async createPost(postData: Partial<IPost>) {
        const post = new PostModel(postData);
        return post.save();
    }

    async getPostById(id: string) {
        return PostModel.findById(id).exec();
    }

    async getAllPosts(skip: number = 0, limit: number = 10) {
        return PostModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async updatePost(id: string, updateData: Partial<IPost>) {
        return PostModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).exec();
    }

    async deletePost(id: string) {
        const deleted = await PostModel.findByIdAndDelete(id).exec();
        return !!deleted;
    }

    async getDrafts(userId: string) {
        return PostModel.find({ author: userId, status: "draft" }).exec();
    }

    async incrementViews(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } }).exec();
    }

    async incrementLikes(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }).exec();
    }

    async decrementLikes(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } }).exec();
    }

    async incrementSaves(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { savesCount: 1 } }).exec();
    }

    async decrementSaves(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } }).exec();
    }

    async incrementShares(postId: string) {
        return PostModel.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } }).exec();
    }

    // In PostRepository
async incrementComments(postId: string) {
    return PostModel.findByIdAndUpdate(
        postId,
        { $inc: { commentsCount: 1 } },
        { new: true }
    );
}

async decrementComments(postId: string) {
    return PostModel.findByIdAndUpdate(
        postId,
        { $inc: { commentsCount: -1 } },
        { new: true }
    );
}

    async getFeedPosts(followingIds: string[], lastCreatedAt?: string, limit: number = 10) {
        const query: any = {
            author: { $in: followingIds },
            status: "published",
            visibility: "public",
        };
        if (lastCreatedAt) query.createdAt = { $lt: new Date(lastCreatedAt) };

        return PostModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    async getRankedFeedPosts(followingIds: string[], skip: number = 0, limit: number = 10) {
        const followingObjectIds = followingIds.map(id => new mongoose.Types.ObjectId(id));
        console.log("Querying posts with authors in:", followingIds);
const posts = await PostModel.find({ author: { $in: followingIds } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
console.log("Posts found:", posts.length);

        return PostModel.aggregate([
            { $match: { author: { $in: followingObjectIds }, status: "published", visibility: "public" } },
            {
                $addFields: {
                    engagementScore: {
                        $add: [
                            { $multiply: ["$likesCount", 3] },
                            { $multiply: ["$commentsCount", 5] },
                            { $multiply: ["$sharesCount", 4] },
                            { $multiply: ["$viewsCount", 1] },
                        ],
                    },
                },
            },
            {
                $addFields: {
                    hoursSincePosted: {
                        $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60],
                    },
                },
            },
            { $addFields: { finalScore: { $divide: ["$engagementScore", { $add: ["$hoursSincePosted", 1] }] } } },
            { $sort: { finalScore: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
    }
}
