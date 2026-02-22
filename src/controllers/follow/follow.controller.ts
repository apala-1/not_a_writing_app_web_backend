import { Request, Response } from "express";
import { FollowDTO } from "../../dtos/profile.dto";
import { FollowService } from "../../services/follow.service";

const followService = new FollowService();

export class FollowController {
    async follow(req: Request, res: Response) {
        try {
            const parsed = FollowDTO.parse(req.body);
            const result = await followService.follow(req.user!._id.toString(), parsed.targetUserId);
            res.json({ success: true, data: result });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async unfollow(req: Request, res: Response) {
        try {
            const parsed = FollowDTO.parse(req.body);
            const result = await followService.unfollow(req.user!._id.toString(), parsed.targetUserId);
            res.json({ success: true, data: result });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async searchUsers(req: Request, res: Response) {
  try {
    const q = req.query.q as string;

    const users = await followService.searchUsers(q);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    res.status(500).json({ success: false, message });
  }
}

    async followers(req: Request, res: Response) {
        try {
            const data = await followService.getFollowers(req.params.userId);
            res.json({ success: true, data });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async following(req: Request, res: Response) {
        try {
            const data = await followService.getFollowing(req.params.userId);
            res.json({ success: true, data });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async canMessage(req: Request, res: Response) {
        try {
            const { userA, userB } = req.params;
            const result = await followService.canMessage(userA, userB);
            res.json({ success: true, canMessage: result });
        } catch (err: any) {
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async followStatus(req: any, res: any) {
  try {
    const followerId = req.user.id; // from auth middleware
    const followedId = req.params.userId;

    const isFollowing = await followService.isFollowing(
      followerId,
      followedId
    );

    return res.json({
      success: true,
      data: { isFollowing },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async followCount(req: any, res: any) {
  try {
    const userId = req.params.userId;

    const counts = await followService.getCounts(userId);

    return res.json({
      success: true,
      data: counts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async mutuals(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const data = await followService.getMutuals(userId);

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
}