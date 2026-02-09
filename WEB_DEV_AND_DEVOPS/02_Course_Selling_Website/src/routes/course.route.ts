import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/course.controller";
import {
  createLession,
  getAllLessions,
} from "../controllers/lessions.controller";
import { authMiddleware } from "../middleware/auth.middlewrae";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// routes
router
  .get("/", getAllCourses)
  .post("/", authMiddleware, requireRole("INSTRUCTOR"), createCourse);

router.get("/:id", getCourseById);
router.patch(
  "/:id",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  updateCourseById,
);
router.delete("/:id", authMiddleware, requireRole("INSTRUCTOR"), deleteCourse);
router.post(
  "/:courseId/lessons",
  authMiddleware,
  requireRole("INSTRUCTOR"),
  createLession,
);
router.get("/:courseId/lessons", getAllLessions);

export default router;
