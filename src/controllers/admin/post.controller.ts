import { Request, Response } from "express";
import { PostService } from "../../services/post.service";
import { PostModel } from "../../model/post.model";
import fs from "fs";
import path from "path";

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
      const updated = await PostModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updated)
        return res.status(404).json({ success: false, message: "Post not found" });

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
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