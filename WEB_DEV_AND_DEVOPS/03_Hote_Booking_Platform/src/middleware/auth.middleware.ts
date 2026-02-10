import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/Jwt.utils";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "customer" | "owner";
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "UNAUTHORIZED",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token!);
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
