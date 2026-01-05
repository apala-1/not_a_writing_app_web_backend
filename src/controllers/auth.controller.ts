import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import type { CreateUserType, LoginUserType } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { formatZodError } from "../errors/http-error";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
        console.log("Request body:", req.body);
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: formatZodError(parsed.error),
        });
      }

      const data: CreateUserType = parsed.data;
      const newUser = await userService.createUser(data);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = LoginUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: formatZodError(parsed.error),
        });
      }

      const credentials: LoginUserType = parsed.data;
      const { token, user } = await userService.loginUser(credentials);

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        data: { user, token },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
