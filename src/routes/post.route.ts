import express, { Router } from "express"; 
import app from "../app";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploadPost } from "../config/multer";
import { PostController } from "../controllers/posts/post.controller";

const postController = new PostController();
const router = Router();

router.get("/", authorizedMiddleware, postController.getAllPosts.bind(postController));
router.get("/:id", authorizedMiddleware, postController.getPost.bind(postController));
router.post("/", authorizedMiddleware, uploadPost.array("attachments", 5), postController.createPost.bind(postController));
router.put("/:id", authorizedMiddleware, uploadPost.array("attachments", 5), postController.updatePost.bind(postController));
router.delete("/:id", authorizedMiddleware, postController.deletePost.bind(postController));

export default router;
