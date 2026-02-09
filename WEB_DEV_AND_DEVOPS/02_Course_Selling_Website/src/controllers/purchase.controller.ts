import type { Request, Response } from "express";
import prisma from "../db/db";

export const purchaseCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const courseId = String(req.params.courseId);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: id,
        courseId,
      },
    });
    if (existingPurchase) {
      return res.status(400).json({ error: "Course already purchased" });
    }
    await prisma.purchase.create({
      data: {
        userId: id,
        courseId,
      },
    });
    res.status(200).json({ message: "Course purchased successfully" });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const purchases = await prisma.purchase.findMany({
      where: { userId: id },
      include: {
        course: true,
      },
    });
    res.status(200).json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
