import { CommentRepository } from "../repository/comment.repository";
import { Types } from "mongoose";

export class CommentService {
  private repo = new CommentRepository();

  async createComment(userId: string, postId: string, content: string) {
    return this.repo.create({
      user: new Types.ObjectId(userId),
      post: new Types.ObjectId(postId),
      content,
    });
  }

  async getCommentsByPost(postId: string) {
    return this.repo.findByPost(postId);
  }

  async updateComment(commentId: string, userId: string, content: string) {
  return this.repo.update(commentId, userId, content);
}

  async deleteComment(commentId: string, userId: string) {
    return this.repo.delete(commentId, userId);
  }
}
