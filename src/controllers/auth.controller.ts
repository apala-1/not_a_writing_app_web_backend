import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { z } from "zod";
import { IUser, UserModel } from "../model/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../config/email";
import { UserRepository } from "../repository/user.repository";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const userService = new UserService();
const userRepository = new UserRepository();

export class AuthController {
  async register(req: MulterRequest, res: Response) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const newUser = await userService.createUser(parsed.data);
      return res.status(201).json({ success: true, message: "User created", data: newUser });
    } catch (err: any) {
      return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = LoginUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const { token, user } = await userService.loginUser(parsed.data);
      res.cookie("accessToken", token, {
  httpOnly: true,
  secure: false,      
  sameSite: "lax",   
});

res.cookie("role", user.role, {
  httpOnly: false,  
  secure: false,
  sameSite: "lax",
});

return res.status(200).json({
  success: true,
  message: "Login successful",
  data: {
    user,
    token
  },
});

    } catch (err: any) {
      return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
    }
  }

  async getMe(req: Request, res: Response) {
    return res.status(200).json({ success: true, data: req.user });
  }

  async updateMe(req: MulterRequest, res: Response) {
  try {
    // Only allow certain fields
    const allowedFields: (keyof IUser)[] = ["name", "email", "password", "bio", "occupation"];
    const updates: Partial<IUser> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]; // TS is happy now
      }
    }

    if (req.file) updates.profilePicture = req.file.filename;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    const updated = await userRepository.updateUser(req.user!._id.toString(), updates);
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });

    const { password, ...userSafe } = updated.toObject();
    return res.status(200).json({ success: true, data: userSafe });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async deleteMe(req: Request, res: Response) {
  try {
    const deleted = await userRepository.deleteUser(req.user!._id.toString());
    if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/resetPass?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset",
      `<p>You requested a password reset</p>
       <p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>`
    );

    return res.status(200).json({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}


}
