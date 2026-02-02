import { Request, Response } from "express";
import { UserRepository } from "../../repository/user.repository";
import { IUser } from "../../model/user.model";
import bcrypt from "bcryptjs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const userRepository = new UserRepository();

export class AdminController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      const safeUsers = users.map(u => {
        const { password, ...rest } = u.toObject();
        return rest;
      });
      res.status(200).json({ success: true, data: safeUsers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userRepository.getUserById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      const { password, ...safe } = user.toObject();
      res.status(200).json({ success: true, data: safe });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateUser(req: MulterRequest, res: Response) {
    try {
      const updates: Partial<IUser> = { ...req.body };
      if (req.file) updates.profilePicture = req.file.filename;
      if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

      const updated = await userRepository.updateUser(req.params.id, updates);
      if (!updated) return res.status(404).json({ success: false, message: "User not found" });

      const { password, ...safe } = updated.toObject();
      res.status(200).json({ success: true, data: safe });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const deleted = await userRepository.deleteUser(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
