import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  role: z.enum(
    ["STUDENT", "INSTRUCTOR"],
    "Role must be either 'student' or 'instructor'",
  ),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const CreateCourseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  price: z.number().positive("Price must be a positive number"),
});

export const CreateLessonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  courseId: z.string().uuid("Invalid course ID"),
});

export const PurchaseCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});
