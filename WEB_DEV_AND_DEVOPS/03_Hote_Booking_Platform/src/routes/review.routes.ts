import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/checkRole";
import { createReview } from "../controllers/review.controller";

const router = Router();

router.post("/", authMiddleware, requireRole("customer"), createReview);

export default router;
