import { CommentRepository } from "../repository/comment.repository";
import { PostRepository } from "../repository/post.repository";
import { Types } from "mongoose";
import { Comment } from "../model/comment.model";

export class CommentService {
  private repo = new CommentRepository();
  private postRepo = new PostRepository();
  async createComment(userId: string, postId: string, content: string) {
    const comment = await this.repo.create({
      user: new Types.ObjectId(userId),
      post: new Types.ObjectId(postId),
      content,
    });

    await this.postRepo.incrementComments(postId);

    return comment;
  }

  async getCommentsByPost(postId: string) {
    return this.repo.findByPost(postId);
  }

  async updateComment(commentId: string, userId: string, content: string) {
  return this.repo.update(commentId, userId, content);
}

  async deleteComment(commentId: string, userId: string) {
    const deleted =  await this.repo.delete(commentId, userId);

    if(deleted) {
        await this.postRepo.decrementComments(deleted.post.toString());
    }

    return deleted;
  }

  async replyToComment(userId: string, postId: string, content: string, parentCommentId: string) {
  const reply = await this.repo.create({
    user: new Types.ObjectId(userId),
    post: new Types.ObjectId(postId),
    content,
    parentComment: new Types.ObjectId(parentCommentId),
  });

  // update parent comment
  await Comment.findByIdAndUpdate(parentCommentId, {
    $push: { replies: reply._id },
  });

  await this.postRepo.incrementComments(postId);
  return reply;
}
}
