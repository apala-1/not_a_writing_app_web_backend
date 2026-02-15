import { Comment } from "../model/comment.model";
import { IComment } from "../types/comment.type";
import { Types } from "mongoose";

export class CommentRepository {
  async create(data: IComment) {
    return Comment.create(data);
  }

  async findByPost(postId: string) {
    return Comment.find({ post: new Types.ObjectId(postId) })
      .populate("user", "username email")
      .sort({ createdAt: -1 });
  }

  async update(commentId: string, userId: string, content: string) {
  return Comment.findOneAndUpdate(
    {
      _id: commentId,
      user: userId, // ownership check
    },
    { content },
    { new: true }
  );
}

  async delete(commentId: string, userId: string) {
    return Comment.findOneAndDelete({
      _id: new Types.ObjectId(commentId),
      user: new Types.ObjectId(userId),
    });
  }
}
