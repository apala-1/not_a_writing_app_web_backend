import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { ChatController } from "../controllers/chat/chat.controller";

const chatController = new ChatController();
const router = Router();

router.use(authorizedMiddleware);

// Send a message
router.post("/send", chatController.sendMessage.bind(chatController));
router.get("/conversations", authorizedMiddleware, chatController.getMyConversations.bind(chatController));
router.post("/mark-as-read", chatController.markAsRead.bind(chatController));
router.get("/unread-counts", chatController.getUnreadCounts.bind(chatController));

// Get conversation between two users
router.get("/conversation/:userA/:userB", chatController.getConversation.bind(chatController));

export default router;