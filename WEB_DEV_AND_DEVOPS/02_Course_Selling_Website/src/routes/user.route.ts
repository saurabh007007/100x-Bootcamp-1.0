import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middlewrae";
import { requireRole } from "../middleware/role.middleware";
import { getAllPurchases } from "../controllers/purchase.controller";

const router = Router();
router.get(
  "/:id/purchases",
  authMiddleware,
  requireRole("STUDENT"),
  getAllPurchases,
);

export default router;
