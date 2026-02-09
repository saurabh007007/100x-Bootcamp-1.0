import type { Request, Response } from "express";
import prisma from "../db/db";
import { CreateLessonSchema } from "../validations/SchemaValidation";

export const createLession = async (req: Request, res: Response) => {
  const { id } = req.user!;
  const parsedBody = CreateLessonSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: parsedBody.error });
  }
  const courseId = String(req.params.courseId || parsedBody.data.courseId);
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (course.instructorId !== id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const newLession = await prisma.lesson.create({
      data: {
        title: parsedBody.data.title,
        content: parsedBody.data.content,
        courseId,
      },
    });
    res.status(200).json(newLession);
  } catch (error) {
    console.error("Error creating lession:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllLessions = async (req: Request, res: Response) => {
  const courseId = String(req.params.courseId);
  try {
    const lessions = await prisma.lesson.findMany({
      where: { courseId },
    });
    res.status(200).json(lessions);
  } catch (error) {
    console.error("Error fetching lession:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
