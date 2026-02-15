import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "../types/comment.type";

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
  },
  { timestamps: true }
);

export const Comment: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);
