import { Request, Response } from "express";
import { Chat } from "../../model/chat.model";

export class ChatController {
  // Send message
  async sendMessage(req: Request, res: Response) {
    try {
      const { receiver, message } = req.body;
      const sender = req.user?._id; // assuming authorizedMiddleware sets req.user
      if (!sender || !receiver || !message) {
        return res.status(400).json({ success: false, message: "Invalid data" });
      }

      const chat = await Chat.create({ sender, receiver, message });
      res.status(201).json({ success: true, data: chat });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get conversation between two users
  async getConversation(req: Request, res: Response) {
    try {
      const { userA, userB } = req.params;
      const messages = await Chat.find({
        $or: [
          { sender: userA, receiver: userB },
          { sender: userB, receiver: userA },
        ],
      }).sort({ createdAt: 1 }); // oldest first

      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}