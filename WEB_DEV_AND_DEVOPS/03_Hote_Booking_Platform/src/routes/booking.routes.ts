import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  getMyBookings,
} from "../controllers/bookings.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/checkRole";

const router = Router();

router.post("/", authMiddleware, requireRole("customer"), createBooking);
router.get("/", authMiddleware, requireRole("customer"), getMyBookings);
router.put(
  "/:bookingId/cancel",
  authMiddleware,
  requireRole("customer"),
  cancelBooking,
);

export default router;
