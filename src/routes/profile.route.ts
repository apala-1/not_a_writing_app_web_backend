import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const profileController = new ProfileController();
const router = Router();

router.use(authorizedMiddleware);

router.get("/profile/:userId", profileController.getWholeProfile.bind(profileController));
// GET /profile/:userId/posts
router.get("/profile/:userId/posts", profileController.getOwnPosts.bind(profileController));
router.get("/:userId", profileController.getProfile.bind(profileController));
router.post("/follow", profileController.follow.bind(profileController));
router.post("/unfollow", profileController.unfollow.bind(profileController));
router.post("/post-action", profileController.addPostAction.bind(profileController));

export default router;
