import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middlewrae";
import { purchaseCourse } from "../controllers/purchase.controller";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, requireRole("STUDENT"), purchaseCourse);

export default router;
