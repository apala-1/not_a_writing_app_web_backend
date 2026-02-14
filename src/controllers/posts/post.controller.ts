import z, { success } from "zod";
import { CreatePostDTO, EditPostDTO } from "../../dtos/post.dto";
import { PostService } from "../../services/post.service";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { IUser } from "../../model/user.model";

const postService = new PostService();

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export class PostController {
    async createPost(req: Request, res: Response) {
        try {
            const parsed = CreatePostDTO.safeParse(req.body);
            if(!parsed.success){
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsed.error),
                });
            }

            const getFileType = (mimetype: string): "file" | "image" | "gif" => {
                if (mimetype === "image/gif") return "gif";
                if(mimetype.startsWith("image/")) return "image";
                return "file";
            };

            const files = req.files as Express.Multer.File[] | undefined;

            const attachments = files?.map(file => (
                {
                url: `/uploads/posts/${file.filename}`,
                type: getFileType(file.mimetype)
            })) ?? [];

            const post = await postService.createPost(
                {
                    ...parsed.data, attachments
                }, req.user!._id.toString()
            );

            return res.status(201).json({
                success: true,
                data: post,
            });
        } catch (err: any) {
            return res.status(err.statusCode ?? 500).json({
                success: false,
                message: err.message,
            });
        }
    }
    async updatePost(req: Request, res: Response) {
        try {
            const parsed = EditPostDTO.safeParse(req.body);
            if(!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsed.error),
                });
            }

            const getFileType = (mimetype: string): "file" | "image" | "gif" => {
                if (mimetype === "image/gif") return "gif";
                if(mimetype.startsWith("image/")) return "image";
                return "file";
            };

            const files = req.files as Express.Multer.File[] | undefined;
            const attachments = files?.map(file => ({
                url: `/uploads/posts/${file.filename}`,
                type: getFileType(file.mimetype),
            }));

            if (attachments && attachments.length > 0) {
                const oldPost = await postService.getPostById(req.params.id);
                oldPost.attachments.forEach(file => {
                    const filePath = path.join(process.cwd(), file.url);
                    if(fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            }

            const updateData = {
                ...parsed.data,
                ...(attachments ? { attachments } : {}),
            };

            const updated = await postService.updatePost(
                req.params.id,
                updateData,
                req.user!._id.toString()
            );

            return res.status(200).json({
                success: true,
                data: updated,
            });
        } catch (err: any) {
            return res.status(err.statusCode ?? 500).json({
                success: false,
                message: err.message,
            });
        }
    }
    async getPost(req: Request, res: Response) {
        try{
            const post = await postService.getPostById(req.params.id);
            if(!post) return res.status(404).json({ success: false, message: "Post not found" });
            return res.status(200).json({ success: true, data: post });
        } catch(err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    async getAllPosts(req: Request, res: Response) {
        try {
            const skip = parseInt(req.query.skip as string) || 0;
            const limit = parseInt(req.query.limit as string) || 10;
            const posts = await postService.getAllPosts(skip, limit);
            return res.status(200).json({ success: true, data: posts });
        } catch(err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    async deletePost(req: Request, res: Response) {
        try {
            const post = await postService.getPostById(req.params.id);
            if(!post) return res.status(404).json({ success: false, message: "Post not found" });
            if (post.author.toString() != req.user!._id.toString())
                return res.status(403).json({ success: false, message: "Unauthorized" });

            // deleting files from uploads
            if(post.attachments) {
                for (const att of post.attachments) {
                    const filePath = path.join(process.cwd(), att.url);
                    if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            }

            await postService.deletePost(req.params.id, req.user!._id.toString());
            return res.status(200).json({ success: true, message: "Deleted" });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}