import { Request, Response } from "express";
import { CommentService } from "../../services/comment.service";
import { createCommentDTO } from "../../dtos/comment.dto";

const service = new CommentService();

export class CommentController {
  async create(req: Request, res: Response) {
    try {
      const parsed = createCommentDTO.parse(req.body);

      const userId = (req as any).user.id;

      const comment = await service.createComment(
        userId,
        parsed.postId,
        parsed.content
      );

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const comments = await service.getCommentsByPost(postId);

      res.json({
        success: true,
        data: comments,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const updated = await service.updateComment(commentId, userId, content);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or not authorized",
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


  async delete(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = (req as any).user.id;

      const deleted = await service.deleteComment(commentId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Comment not found or not authorized",
        });
      }

      res.json({
        success: true,
        message: "Comment deleted",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
