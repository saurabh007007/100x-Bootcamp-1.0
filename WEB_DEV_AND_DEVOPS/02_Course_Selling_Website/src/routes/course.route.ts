import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/course.controller";
import { authMiddleware } from "../middleware/auth.middlewrae";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// routes
router
  .get("/", getAllCourses)
  .post("/", authMiddleware, requireRole("INSTRUCTOR"), createCourse);

router.get("/:id", authMiddleware, getCourseById);
router.patch(
  "/:id",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateCourseById,
);
router.delete("/:id", authMiddleware, requireRole("INSTRUCTOR"), deleteCourse);
router.get(
  "/:courseId/lessions",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  getCourseById,
);

export default router;
