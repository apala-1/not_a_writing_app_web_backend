import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const profileController = new ProfileController();
const router = Router();

router.use(authorizedMiddleware);

import { Request, Response, NextFunction } from "express";

router.get(
  "/me",
  (req: Request<{ userId: string }>, res: Response) => {
    req.params.userId = req.user!._id.toString();
    return profileController.getWholeProfile(req, res);
  }
);

router.get(
  "/me/posts",
  (req: Request<{ userId: string }>, res: Response) => {
    req.params.userId = req.user!._id.toString();
    return profileController.getOwnPosts(req, res);
  }
);

router.get("/profile/:userId", profileController.getWholeProfile.bind(profileController));
// GET /profile/:userId/posts
router.get("/profile/:userId/posts", profileController.getOwnPosts.bind(profileController));
router.get("/:userId", profileController.getProfile.bind(profileController));
router.post("/follow", profileController.follow.bind(profileController));
router.post("/unfollow", profileController.unfollow.bind(profileController));
router.post("/post-action", profileController.addPostAction.bind(profileController));


export default router;
