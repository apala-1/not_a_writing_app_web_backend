import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChat extends Document {
  sender: Types.ObjectId;      // now matches Schema.Types.ObjectId
  receiver: Types.ObjectId;
  message: string;
  createdAt: Date;
  read: boolean;
}

const chatSchema = new Schema<IChat>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export const Chat = mongoose.model<IChat>("Chat", chatSchema);