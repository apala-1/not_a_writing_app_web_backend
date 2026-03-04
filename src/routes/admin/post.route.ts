import { Router } from "express";
import { AdminPostController } from "../../controllers/admin/post.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import { uploadPost } from "../../config/multer";

const router = Router();
const controller = new AdminPostController();

// Protect everything
router.use(authorizedMiddleware, adminOnlyMiddleware);

router.get("/", controller.getAllPosts.bind(controller));
router.get("/:id", controller.getPost.bind(controller));
router.post("/", uploadPost.array("attachments", 5), controller.createPost.bind(controller));
router.put("/:id", uploadPost.array("attachments", 5), controller.updatePost.bind(controller));
router.delete("/:id", controller.deletePost.bind(controller));

export default router;