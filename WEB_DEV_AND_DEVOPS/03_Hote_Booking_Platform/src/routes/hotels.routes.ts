import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/checkRole";
import {
  createHotels,
  createRooms,
  getAllHotels,
  getHotelById,
} from "../controllers/hotels.controller";

const router = Router();

//Create hotel
router.post("/", authMiddleware, requireRole("owner"), createHotels);
router.post("/:id/rooms", authMiddleware, requireRole("owner"), createRooms);
router.get("/", authMiddleware, getAllHotels);
router.get("/:id", authMiddleware, getHotelById);

export default router;
