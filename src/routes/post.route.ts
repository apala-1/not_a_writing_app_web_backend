import express, { Router } from "express"; 
import app from "../app";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploadPost } from "../config/multer";
import { PostController } from "../controllers/posts/post.controller";

const postController = new PostController();
const router = Router();

router.post("/", authorizedMiddleware, uploadPost.array("attachments", 5), postController.createPost.bind(postController));

export default router;
