import { Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { IAttachment, PostModel } from "../../model/post.model";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const postService = new PostService();

export class AdminPostController {

async getAllPosts(req: Request, res: Response) {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    const total = await PostModel.countDocuments();

    const posts = await PostModel.find()
      .populate("author")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: posts,
      total,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

  async getPost(req: Request, res: Response) {
    try {
      const post = await PostModel.findById(req.params.id).populate("author");
      if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

      return res.status(200).json({ success: true, data: post });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

async updatePost(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      // 1️⃣ Get fields from req.body
      const { title, content, existingAttachments } = req.body;

      // Ensure existingAttachments is always an array of strings
      const keepIds: string[] = existingAttachments
        ? Array.isArray(existingAttachments)
          ? existingAttachments
          : [existingAttachments]
        : [];

      // 2️⃣ Filter out removed attachments from DB and delete from disk
      const removedAttachments = post.attachments.filter(
        (att) => !keepIds.includes(att._id as string)
      );

      for (const att of removedAttachments) {
        const filePath = path.join(process.cwd(), att.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // 3️⃣ Keep only attachments that are still there
      post.attachments = post.attachments.filter((att) =>
        keepIds.includes(att._id as string)
      );

      // 4️⃣ Add newly uploaded files (if any)
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];
        const newAttachments: IAttachment[] = files.map((f) => ({
          _id: new mongoose.Types.ObjectId().toString(), // string _id
          url: `/uploads/posts/${f.filename}`,
          type: "image", // adjust based on file type if needed
        }));
        post.attachments.push(...newAttachments);
      }

      // 5️⃣ Update title/content
      if (title) post.title = title;
      if (content) post.content = content;

      await post.save();

      return res.status(200).json({ success: true, data: post });
    } catch (err: any) {
      console.error("Update Post Error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  
  async deletePost(req: Request, res: Response) {
    try {
      const post = await PostModel.findById(req.params.id);
      if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

      // delete attachments from disk
      if (post.attachments) {
        for (const att of post.attachments) {
          const filePath = path.join(process.cwd(), att.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      await PostModel.findByIdAndDelete(req.params.id);

      return res.status(200).json({ success: true, message: "Post deleted by admin" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

 async createPost(req: Request, res: Response) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // convert ObjectId to string
    const userId = req.user._id.toString();

    const post = await postService.createPost(req.body, userId);

    return res.status(201).json({ success: true, data: post });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({
      success: false,
      message: err.message,
    });
  }
}
};