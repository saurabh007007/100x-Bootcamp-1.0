import type { Request, Response } from "express";
import { LoginSchema, SignupSchema } from "../validations/SchemaValidation";
import prisma from "../db/db";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.utils";

export const SignupUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = SignupSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid request data" });
    }
    const { email, password, role, name } = parsedBody.data;
    const UserExists = await prisma.user.findUnique({
      where: { email },
    });
    if (UserExists) {
      return res.status(409).json({ error: "User already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        role,
        name,
      },
    });

    return res.status(200).json({
      message: "User created successfully",
      userId: newUser.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  const parsedBody = LoginSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ message: "Invalid request data" });
  }
  try {
    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({ userId: user.id, role: user.role });
    return res.status(200).json({
      message: "Login successful",
      userId: user.id,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
