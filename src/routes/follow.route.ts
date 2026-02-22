import express from "express";
import { FollowController } from "../controllers/follow/follow.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = express.Router();
const ctrl = new FollowController();

router.post("/follow", authorizedMiddleware, ctrl.follow.bind(ctrl));
router.post("/unfollow", authorizedMiddleware, ctrl.unfollow.bind(ctrl));
router.get("/search", authorizedMiddleware, ctrl.searchUsers.bind(ctrl));
router.get("/followers/:userId", authorizedMiddleware, ctrl.followers.bind(ctrl));
router.get("/following/:userId", authorizedMiddleware, ctrl.following.bind(ctrl));
router.get("/can-message/:userA/:userB", authorizedMiddleware, ctrl.canMessage.bind(ctrl));
router.get(
  "/status/:userId",
  authorizedMiddleware,
  ctrl.followStatus.bind(ctrl)
);
router.get(
  "/count/:userId",
  authorizedMiddleware,
  ctrl.followCount.bind(ctrl)
);
router.get(
  "/mutuals/:userId",
  authorizedMiddleware,
  ctrl.mutuals.bind(ctrl)
);

export default router;