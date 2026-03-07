import http from "http";
import { Server } from "socket.io";

export let io: Server;

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: "*", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      console.log("User joined:", userId, socket.id);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) onlineUsers.delete(userId);
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

export function getReceiverSocketId(userId: string) {
  return onlineUsers.get(userId);
}