// chat.model.ts
import { Schema, model, Types } from "mongoose";

interface IChat {
  senderId: string | Types.ObjectId;
  receiverId: string | Types.ObjectId;
  message: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = model<IChat>("Chat", chatSchema); // ✅ export ChatModel