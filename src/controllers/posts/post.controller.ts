import z, { success } from "zod";
import { CreatePostDTO, EditPostDTO } from "../../dtos/post.dto";
import { PostService } from "../../services/post.service";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { IUser } from "../../model/user.model";
import { PostModel } from "../../model/post.model";
import { HttpError } from "../../errors/http-error";
import { ProfileModel } from "../../model/profile.model";
import mongoose from "mongoose";

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

            const getExtensionFromMime = (mimetype: string) => {
                switch (mimetype) {
                    case "image/jpeg":
                    case "image/pjpeg":
                    return ".jpg";
                    case "image/png":
                    return ".png";
                    case "image/gif":
                    return ".gif";
                    case "image/webp":
                    return ".webp";
                    default:
                    return "";
                }
                };


                const getAttachmentType = (
                mimetype: string
                ): "image" | "gif" | "file" => {
                if (mimetype === "image/gif") return "gif";
                if (mimetype.startsWith("image/")) return "image";
                return "file";
                };

            const files = req.files as Express.Multer.File[] | undefined;

            const attachments = files?.map(file => (
                {
                url: `/uploads/posts/${file.filename}`,
                type: getAttachmentType(file.mimetype)
            })) ?? [];

            const post = await postService.createPost(
                {
                    ...parsed.data, attachments,  status: req.body.draft === "true" ? "draft" : "published",
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

// map new uploaded files
const newAttachments = files?.map(file => ({
  url: `/uploads/posts/${file.filename}`,
  type: getFileType(file.mimetype),
})) ?? [];

// handle existing attachments sent from frontend
const existingAttachmentsIds = Array.isArray(req.body.existingAttachments)
  ? req.body.existingAttachments
  : req.body.existingAttachments ? [req.body.existingAttachments] : [];

const oldPost = await postService.getPostById(req.params.id);

// keep only existing attachments that weren’t deleted
const remainingAttachments = oldPost.attachments.filter(att =>
  existingAttachmentsIds.includes(att._id!.toString())
);

// combine new + remaining attachments
const attachments = [...remainingAttachments, ...newAttachments];

// update post with text fields + attachments
const updateData = {
  title: parsed.data.title,
  description: parsed.data.description,
  content: parsed.data.content,
  attachments,
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
            const userId = req.user!._id.toString();
const posts = await postService.getAllPosts(userId, skip, limit);
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
    async getDrafts(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            const drafts = await postService.getDrafts(req.user._id.toString());
            return res.status(200).json({ success: true, data: drafts });
        } catch(err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    async addView(req: Request, res: Response) {
        const { id } = req.params;

        await postService.addView(id);

        res.status(200).json({ message: "View counted" });
    }
    // In your postService
async getFeed(req: Request, res: Response) {
    const userId = req.params.id;
    const { lastCreatedAt, limit } = req.query as { lastCreatedAt?: string; limit?: string };

    const feed = await postService.getFeed(
        userId,
        lastCreatedAt,
        limit ? parseInt(limit, 10) : 10
    );

    res.json(feed);
}

    async toggleLike(req: Request, res: Response) {
  try {
    const postId = req.params.postId;
    const userId = req.user!._id.toString(); // from auth middleware

    const updatedPost = await postService.toggleLike(postId, userId);

    return res.status(200).json({ success: true, data: updatedPost });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

    // POST /posts/:postId/save
async toggleSave(req: Request, res: Response) {
  try {
    const postId = req.params.postId;
    const userId = req.user!._id.toString();

    const updatedPost = await postService.toggleSave(postId, userId);

    return res.status(200).json({
      success: true,
      data: updatedPost
    });

  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({
      success: false,
      message: err.message,
    });
  }
}

// Fetch saved posts properly
async getSavedPosts(userId: string) {
  const profile = await ProfileModel.findOne({ user: userId }).lean();
  if (!profile) throw new HttpError("Profile not found", 404);

  const posts = await PostModel.find({ _id: { $in: profile.savedPosts ?? [] } })
    .populate("author")
    .sort({ createdAt: -1 });

  return posts;
}

    async addShare(req: Request, res: Response) {
        try {
            const postId = req.params.id;

            await postService.addShare(postId);

            return res.status(200).json({ success: true, message: "Share counted" });
        } catch (err: any) {
            return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
        }
    }

    async getRankedFeed(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const skip = parseInt(req.query.skip as string) || 0;
            const limit = parseInt(req.query.limit as string) || 10;

            const posts = await postService.getRankedFeed(userId, skip, limit);
            console.log("Ranked feed posts:", posts);

            return res.status(200).json({ success: true, data: posts });
        } catch (err: any) {
            return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
        }
    }

async getLikedPosts(req: Request, res: Response) {
  try {
    const userId = req.user!._id.toString();
    const posts = await postService.getLikedPosts(userId);
    return res.status(200).json({ success: true, data: posts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


    async getMyPosts(req: Request, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const posts = await postService.getMyPosts(req.user._id.toString());
        return res.status(200).json({ success: true, data: posts });
    } catch (err: any) {
        return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
}
}