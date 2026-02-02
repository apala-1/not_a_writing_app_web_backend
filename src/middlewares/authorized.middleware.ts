import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../model/user.model";
import { HttpError } from "../errors/http-error";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const userRepository = new UserRepository();

// Protect routes and attach user
export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError("Unauthorized: token malformed", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError("Unauthorized: No token provided", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded || !decoded.id) {
      throw new HttpError("Unauthorized: Invalid token", 401);
    }

    const user = await userRepository.getUserById(decoded.id);
    if (!user) {
      throw new HttpError("Unauthorized: User not found", 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(error.statusCode ?? 401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};

// Admin-only middleware
export const adminOnlyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new HttpError("Forbidden: No user info", 403);
    }
    if (req.user.role !== "admin") {
      throw new HttpError("Forbidden: Admins only", 403);
    }
    next();
  } catch (error: any) {
    return res.status(error.statusCode ?? 403).json({
      success: false,
      message: error.message || "Forbidden",
    });
  }
};

// Flexible role-based authorization
export const authorizeMiddleware = (...roles: ("user" | "admin")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
