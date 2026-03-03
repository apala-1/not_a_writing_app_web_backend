// chat.model.ts
import { Schema, model, Types } from "mongoose";

interface IChat {
  senderId: string | Types.ObjectId;
  receiverId: string | Types.ObjectId;
  type: "text" | "image";      // new field for message type
  content: string;             // rename message → content
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["text", "image"], default: "text" }, // new
    content: { type: String, required: true }, // renamed
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = model<IChat>("Chat", chatSchema); // ✅ export ChatModel