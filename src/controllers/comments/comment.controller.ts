import { Request, Response } from "express";
import { CommentService } from "../../services/comment.service";
import { Comment } from "../../model/comment.model";

export class CommentController {
  private service = new CommentService();

  async create(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { postId, content } = req.body;

      const comment = await this.service.createComment(userId, postId, content);

      const populated = await Comment.findById(comment._id).populate(
        "user",
        "_id name email profilePicture"
      );

      return res.status(201).json({ success: true, data: populated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const comments = await this.service.getCommentsByPost(postId);
      return res.json({ success: true, data: comments });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async reply(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { postId, parentCommentId, content } = req.body;

      const reply = await this.service.replyToComment(
        userId,
        postId,
        content,
        parentCommentId
      );

      const populated = await Comment.findById(reply._id).populate(
        "user",
        "_id name email profilePicture"
      );

      return res.status(201).json({ success: true, data: populated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { commentId } = req.params;
      const { content } = req.body;

      const updated = await this.service.updateComment(commentId, userId, content);
      if (!updated) return res.status(404).json({ success: false, message: "Not found" });

      const populated = await Comment.findById(updated._id).populate(
        "user",
        "_id name email profilePicture"
      );

      return res.status(200).json({ success: true, data: populated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { commentId } = req.params;

      const deleted = await this.service.deleteComment(commentId, userId);
      if (!deleted) return res.status(404).json({ success: false, message: "Not found" });

      return res.json({ success: true, message: "Deleted" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}