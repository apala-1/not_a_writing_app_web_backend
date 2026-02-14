import mongoose from "mongoose";
import { CreatePostDTO } from "../dtos/post.dto";
import { HttpError } from "../errors/http-error";
import { IPost } from "../model/post.model";
import { PostRepository } from "../repository/post.repository";

const postRepository = new PostRepository();

export class PostService {
    async createPost(data: CreatePostDTO, userId: string): Promise<IPost> {
        const postData: Partial<IPost> = {
            ...data,
            author: new mongoose.Types.ObjectId(userId),
        };

        return await postRepository.createPost(postData);
    }
    async getPostById(id: string): Promise<IPost> {
        const post = await postRepository.getPostById(id);
        if (!post) throw new HttpError("Post not found", 404);
        return post;
    }
    async getAllPosts(skip: number = 0, limit: number = 10): Promise<IPost[]> {
        return await postRepository.getAllPosts(skip, limit);
    }
    async updatePost(id: string, data: Partial<CreatePostDTO>, userId: string): Promise<IPost> {
        const post = await postRepository.getPostById(id);
        if (!post) throw new HttpError("Post not found", 404);
        if (post.author.toString() !== userId) throw new HttpError("Unauthorized", 403);
        const updated =  await postRepository.updatePost(id, data);
        if (!updated) throw new HttpError("Failed to update post", 500);
        return updated;
    }
    async deletePost(id: string, userId: string): Promise<void> {
        const post = await postRepository.getPostById(id);
        if (!post) throw new HttpError("Post not found", 404);
        if (post.author.toString() !== userId) throw new HttpError("Unauthorized", 403);
        const deleted = await postRepository.deletePost(id);
        if (!deleted) throw new HttpError("Failed to delete post", 500);
    }
    async getDrafts(userId: string): Promise<IPost[]> {
        return await postRepository.getDrafts(userId);
    }
}