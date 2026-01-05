import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
