import { Request, Response } from "express";
import { ChatModel } from "../../model/chat.model";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.user?._id; // TS now knows this exists
      if (!senderId) {
  return res.status(401).json({ success: false, message: "Unauthorized" });
}
      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ success: false, message: "Invalid data" });
      }

      const chat = await ChatModel.create({ senderId, receiverId, message });
      res.status(201).json({ success: true, data: chat });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { userA, userB } = req.params;
      const messages = await ChatModel.find({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      }).sort({ createdAt: 1 });

      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}