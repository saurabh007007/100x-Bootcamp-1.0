import  type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middlewrae";

export function requireRole=(
  role: "STUDENT" | "INSTRUCTOR",
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}