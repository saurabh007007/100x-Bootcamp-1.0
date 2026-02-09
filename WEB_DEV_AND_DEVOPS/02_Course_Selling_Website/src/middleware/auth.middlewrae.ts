import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";

export interface AuthRequest extends Request {
  userId?: string;
  role?: "STUDENT" | "INSTRUCTOR";
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token!);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
