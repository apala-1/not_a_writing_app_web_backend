import z, { success } from "zod";
import { CreatePostDTO } from "../../dtos/post.dto";
import { PostService } from "../../services/post.service";
import { Request, Response } from "express";

const postService = new PostService();

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
}