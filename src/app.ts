import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';   // ✅ import cors
import authRoutes from './routes/auth.route';
import userRoutes from './routes/admin/user.route';
import postRoutes from './routes/post.route';
import bookRoutes from './routes/book.route';
import profileRoutes from './routes/profile.route';
import commentRoutes from './routes/comment.routes';
import followRoutes from './routes/follow.route';
import chatRoutes from './routes/chat.route'; // ✅ import chat routes
import uploadRoutes from './routes/upload.route'; // ✅ import upload routes
import adminPostRoutes from './routes/admin/post.route'; // ✅ import admin post routes
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import http from "http";
import { Server } from "socket.io";

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocket = onlineUsers.get(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        senderId,
        receiverId,
        message,
        createdAt: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
      }
    }
  });
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Add CORS middleware
// const corsOptions = {
//   origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], // allowed origins
//   credentials: true, // allow cookies/auth headers
// };
// app.use(cors(corsOptions));
app.use(cors(
  {origin: true,
  credentials: true}
))

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/book', bookRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/follow', followRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin/posts', adminPostRoutes);
export default app;