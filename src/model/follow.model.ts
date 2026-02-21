import mongoose, { Document, Schema } from "mongoose";

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    followedId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FollowSchema.index(
  { followerId: 1, followedId: 1 },
  { unique: true }
);

export const FollowModel = mongoose.model<IFollow>("Follow", FollowSchema);