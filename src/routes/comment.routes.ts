import { Router } from "express";
import { CommentController } from "../controllers/comments/comment.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const controller = new CommentController();

router.post("/", authorizedMiddleware, controller.create.bind(controller));
router.get("/post/:postId", controller.getByPost.bind(controller));
router.patch("/:commentId", authorizedMiddleware, controller.update.bind(controller));
router.delete("/:commentId", authorizedMiddleware, controller.delete.bind(controller));

export default router;
