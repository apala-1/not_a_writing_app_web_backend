import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { FollowDTO, PostActionDTO } from "../dtos/profile.dto";
import { IUser } from "../model/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const profile = await profileService.getProfile(req.params.userId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async follow(req: Request, res: Response) {
    try {
      const parsed = FollowDTO.parse(req.body);
      const profile = await profileService.follow(req.user!._id.toString(), parsed.targetUserId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async unfollow(req: Request, res: Response) {
    try {
      const parsed = FollowDTO.parse(req.body);
      const profile = await profileService.unfollow(req.user!._id.toString(), parsed.targetUserId);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async addPostAction(req: Request, res: Response) {
    try {
      const parsed = PostActionDTO.parse(req.body);
      const profile = await profileService.addPostAction(req.user!._id.toString(), parsed.postId, parsed.action);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  } 
}
