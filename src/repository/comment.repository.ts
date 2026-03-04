import { Comment } from "../model/comment.model";
import { IComment } from "../types/comment.type";
import { Types } from "mongoose";

export class CommentRepository {
  async create(data: IComment) {
    return Comment.create(data);
  }

  async findByPost(postId: string) {
  const postObjectId = new Types.ObjectId(postId);

  const comments = await Comment.find({
    post: postObjectId,
    parentComment: null
  })
    .populate("user", "_id name email profilePicture")
    .sort({ createdAt: -1 });

  const commentIds = comments.map(c => c._id);

  const replies = await Comment.find({
    parentComment: { $in: commentIds }
  })
    .populate("user", "_id name email profilePicture")
    .sort({ createdAt: 1 });

  const replyMap = new Map();

  replies.forEach(reply => {
    const parentId = reply.parentComment!.toString();
    if (!replyMap.has(parentId)) {
      replyMap.set(parentId, []);
    }
    replyMap.get(parentId).push(reply);
  });

  return comments.map(comment => ({
    ...comment.toObject(),
    replies: replyMap.get(comment._id.toString()) || []
  }));
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
  const comment = await Comment.findOneAndDelete({
    _id: new Types.ObjectId(commentId),
    user: new Types.ObjectId(userId),
  });

  if (comment) {
    await Comment.deleteMany({ parentComment: comment._id });
  }

  return comment;
}
}
