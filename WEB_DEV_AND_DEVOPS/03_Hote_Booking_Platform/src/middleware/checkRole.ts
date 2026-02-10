import type { Request, Response, NextFunction } from "express";

export const requireRole = (role: "customer" | "owner") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res
        .status(403)
        .json({ success: false, message: "FORBIDDEN", data: null });
    }
    next();
  };
};
