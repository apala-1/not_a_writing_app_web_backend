import express, { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploadPost } from "../config/multer";
import { PostController } from "../controllers/posts/post.controller";

const postController = new PostController();
const router = Router();

// Basic CRUD
router.get("/", authorizedMiddleware, postController.getAllPosts.bind(postController));
router.get("/feed", authorizedMiddleware, postController.getFeed.bind(postController));
router.get("/drafts", authorizedMiddleware, postController.getDrafts.bind(postController));
router.get("/:id", authorizedMiddleware, postController.getPost.bind(postController));
router.post("/", authorizedMiddleware, uploadPost.array("attachments", 5), postController.createPost.bind(postController));
router.put("/:id", authorizedMiddleware, uploadPost.array("attachments", 5), postController.updatePost.bind(postController));
router.delete("/:id", authorizedMiddleware, postController.deletePost.bind(postController));

// Views
router.post("/:id/view", authorizedMiddleware, postController.addView.bind(postController));

// Likes & Saves (toggle)
router.post("/toggle-like/:postId", authorizedMiddleware, postController.toggleLike.bind(postController));
router.post("/toggle-save/:postId", authorizedMiddleware, postController.toggleSave.bind(postController));

// Shares
router.post("/:id/share", authorizedMiddleware, postController.addShare.bind(postController));

// Ranked / Algorithmic feed
router.get("/ranked-feed/:userId", authorizedMiddleware, postController.getRankedFeed.bind(postController));

router.get("/my-posts/:userId", authorizedMiddleware, postController.getMyPosts.bind(postController));

router.get("/saved", authorizedMiddleware, postController.getSavedPosts.bind(postController));
router.get("/liked", authorizedMiddleware, postController.getLikedPosts.bind(postController));

export default router;
