import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ChatService } from "../../services/chat.service";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const chatService = new ChatService();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user room
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });

    // Send message
    socket.on("send_message", async (data) => {
      const savedMessage = await chatService.sendMessage(data);

      // Emit to receiver
      io.to(data.receiverId).emit("receive_message", savedMessage);

      // Emit back to sender
      io.to(data.senderId).emit("receive_message", savedMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};