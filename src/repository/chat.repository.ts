import { SendMessageDTO } from "../dtos/chat.dto";
import { ChatModel } from "../model/chat.model";

export class ChatRepository {
  async create(data: SendMessageDTO): Promise<any> { // <- change here
    return ChatModel.create(data);
  }

  async findConversation(userA: string, userB: string): Promise<any> { // <- and here
    return ChatModel.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    }).sort({ createdAt: 1 });
  }
}