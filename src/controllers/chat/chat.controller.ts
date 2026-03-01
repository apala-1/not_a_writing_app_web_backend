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

  async markAsRead(req: Request, res: Response) {
  try {
    const { senderId } = req.body;
    const receiverId = req.user!._id;

    await ChatModel.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async getUnreadCounts(req: Request, res: Response) {
  try {
    const myId = req.user!._id;

    const counts = await ChatModel.aggregate([
      { $match: { receiverId: myId, read: false } },
      { $group: { _id: "$senderId", unreadCount: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, data: counts });
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

  async getMyConversations(req: Request, res: Response) {
  try {
    const myId = req.user!._id;

    const conversations = await ChatModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: myId },
            { receiverId: myId }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ["$senderId", myId] },
              "$receiverId",
              "$senderId"
            ]
          },
          message: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$message" },
          lastTime: { $first: "$createdAt" }
        }
      },
      // Lookup user info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: "$_id",
          lastMessage: 1,
          lastTime: 1,
          name: "$userInfo.name",
          profilePicture: "$userInfo.profilePicture"
        }
      },
      // Filter out self (just in case)
      {
        $match: {
          _id: { $ne: myId }
        }
      }
    ]);

    res.json({ success: true, data: conversations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
}