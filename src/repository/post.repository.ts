import { IPost, PostModel } from "../model/post.model";

export interface IPostRepository {
    createPost(postData: Partial<IPost>): Promise<IPost>;
    getPostById(id: string): Promise<IPost | null>;
    getAllPosts(): Promise<IPost[]>;
    updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null>;
    deletePost(id: string): Promise<boolean>;
}

export class PostRepository implements IPostRepository {
    async createPost(postData: Partial<IPost>): Promise<IPost> {
        const post = new PostModel(postData);
        return await post.save();
    }
    async getPostById(id: string): Promise<IPost | null> {
        return await PostModel.findById(id).exec();
    }
    async getAllPosts(skip: number = 0, limit: number = 10): Promise<IPost[]> {
        return await PostModel.find().skip(skip).limit(limit).exec();
    }
    async updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null> {
        return await PostModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).exec();
    }
    async deletePost(id: string): Promise<boolean> {
        const result =  await PostModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async getDrafts(userId: string): Promise<IPost[]> {
        return await PostModel.find({ author: userId, status: "draft" }).exec();
    }
}