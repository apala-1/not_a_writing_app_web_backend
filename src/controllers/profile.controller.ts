import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { FollowDTO, PostActionDTO } from "../dtos/profile.dto";
import { IUser } from "../model/user.model";
import { UserService } from "../services/user.service";
import { success } from "zod";
import { ProfileModel } from "../model/profile.model";
import { PopulatedProfileType } from "../types/profile.type";

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

  async getWholeProfile(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const profile = await ProfileModel
      .findOne({ user: userId })
      .populate("user") as PopulatedProfileType | null;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: {
        userId: profile.user._id,
        name: profile.user.name,
        email: profile.user.email,
        bio: profile.user.bio,
        postsCount: profile.postsCount,
        followersCount: profile.followers.length,
        followingCount: profile.following.length,
      },
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
  }
}
