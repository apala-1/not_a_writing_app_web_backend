import { Request, Response } from "express";
import { ChatModel } from "../../model/chat.model";
import { io, getReceiverSocketId } from "../../config/socket/socket";

function chatToSocketPayload(chat: any) {
  const obj = chat.toObject ? chat.toObject() : chat;
  return {
    ...obj,
    _id: obj._id?.toString?.() ?? String(obj._id),
    senderId: obj.senderId?.toString?.() ?? String(obj.senderId),
    receiverId: obj.receiverId?.toString?.() ?? String(obj.receiverId),
  };
}

export class ChatController {
  async sendMessage(req: Request, res: Response) {
  try {
    const senderId = req.user?._id;
    const { receiverId, message } = req.body;
    const file = req.file;

    if (!senderId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!receiverId || (!message && !file)) {
      return res.status(400).json({ success: false, message: "Message or image required" });
    }

    const chat = await ChatModel.create({
      senderId,
      receiverId,
      type: file ? "image" : "text",
      content: file ? `/uploads/chats/${file.filename}` : message,
    });

    const payload = chatToSocketPayload(chat);

    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat:new", payload);
    }

    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("chat:new", payload);
    }

    return res.status(201).json({ success: true, data: payload }); // ✅ return once
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async editMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    const chat = await ChatModel.findById(id);
    if (!chat) return res.status(404).json({ success: false, message: "Not found" });

    if (chat.senderId.toString() !== userId!.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    chat.content = content;
    await chat.save();

    const payload = chatToSocketPayload(chat);

    const receiverSocketId = getReceiverSocketId(payload.receiverId);
    const senderSocketId = getReceiverSocketId(payload.senderId);

    if (receiverSocketId) io.to(receiverSocketId).emit("chat:edited", payload);
    if (senderSocketId) io.to(senderSocketId).emit("chat:edited", payload);

    return res.json({ success: true, data: payload }); // ✅ return once
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async deleteMessage(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?._id;

  const chat = await ChatModel.findById(id);
  if (!chat) return res.status(404).json({ success: false, message: "Not found" });

  if (chat.senderId.toString() !== userId!.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const receiverId = chat.receiverId.toString();
const senderId = chat.senderId.toString();

await ChatModel.findByIdAndDelete(id);

const receiverSocketId = getReceiverSocketId(receiverId);
const senderSocketId = getReceiverSocketId(senderId);

if (receiverSocketId) io.to(receiverSocketId).emit("chat:deleted", { id: id.toString() });
if (senderSocketId) io.to(senderSocketId).emit("chat:deleted", { id: id.toString() });

res.json({ success: true, message: "Message deleted" });
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
      console.log(`Fetching conversation between ${userA} and ${userB}`);
      const messages = await ChatModel.find({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      }).sort({ createdAt: 1 });
      console.log("Fetched messages:", messages);

      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      console.error("Error fetching conversation:", err);
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
          content: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$content" },
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