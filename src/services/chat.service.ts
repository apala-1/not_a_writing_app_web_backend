import { SendMessageDTO } from "../dtos/chat.dto";
import { ChatRepository } from "../repository/chat.repository";

export class ChatService {
  private chatRepo = new ChatRepository();

  async sendMessage(data: SendMessageDTO) {
    return this.chatRepo.create(data);
  }

  async getConversation(userA: string, userB: string) {
    return this.chatRepo.findConversation(userA, userB);
  }
}