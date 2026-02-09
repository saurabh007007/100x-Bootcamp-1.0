import type { Request, Response } from "express";
import { CreateCourseSchema } from "../validations/SchemaValidation";
import prisma from "../db/db";

export const createCourse = async (req: Request, res: Response) => {
  const parsedBody = CreateCourseSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: parsedBody.error });
  }
  try {
    const newCourse = await prisma.course.create({
      data: {
        title: parsedBody.data.title,
        description: parsedBody.data.description,
        price: parsedBody.data.price,
        instructorId: req.user!.id,
      },
    });
    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    const courses = await prisma.course.findMany({
      skip,
      take: limit,
    });
    res.status(200).json({ courses, page, limit });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course fetched successfully", course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCourseById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parsedBody = CreateCourseSchema.partial().safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: parsedBody.error });
  }

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (existingCourse.instructorId !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: parsedBody.data,
    });
    res
      .status(200)
      .json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (existingCourse.instructorId !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.course.delete({
      where: { id },
    });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
