import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middlewrae";
import { requireRole } from "../middleware/role.middleware";
import { createLession } from "../controllers/lessions.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("INSTRUCTOR"), createLession);

export default router;
