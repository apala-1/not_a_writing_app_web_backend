import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../model/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
}}

const userRepository = new UserRepository();

export const authorizedMiddleware = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError("Unauthorized: token malformed", 401);
        }

        const token = authHeader.split(" ")[1]; // "Bearer <token>" [1] -> token
        if (!token) {
            throw new HttpError("Unauthorized: No token provided", 401);
        }

        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        if ( !decoded || !decoded.userId ) {
            throw new HttpError("Unauthorized: Invalid token", 401);
        }

        const user = await userRepository.getUserById(decoded.userId);
        if (!user) {
            throw new HttpError("Unauthorized: User not found", 401);
        }

        req.user = user;
        return next();
    } catch (error: any) {
        return res.status(error.statusCode ?? 401).json(
            { success: false, message: error.message || "Unauthorized" }
        );
    }
    // if ( req.headers && req.headers.authorization ) {
    //     return next();
    // }
    // return res.status(401).json({ success: false, message: "Unauthorized" });
}

// middle implemented in routes

export const adminOnlyMiddleware = 
async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        // req.user is set in authorizedMiddleware
        // any function after authorizedMiddleware can access req.user
        if ( !req.user ) {
            throw new HttpError("Forbidden: No user info", 403);
        }
        if ( req.user.role !== "admin" ) {
            throw new HttpError("Forbidden: Admins only", 403);
        }
        return next();
    } catch (error: any) {
        return res.status(error.statusCode ?? 403).json(
            { success: false, message: error.message || "Forbidden" }
        );
    }
}