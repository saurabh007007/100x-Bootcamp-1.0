import type { Request, Response } from "express";
import { LoginSchema, SignUpSchema } from "../validation/SchemaValidation";
import { prisma } from "../db/prisma";
import bcrypt from "bcrypt";
import { signToken } from "../utils/Jwt.utils";
import { is } from "zod/locales";

export const SignUp = async (req: Request, res: Response) => {
  try {
    const parsedBody = SignUpSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const { email, name, password, phone, role } = parsedBody.data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "EMAIL_ALREADY_EXISTS",
      });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: await bcrypt.hash(password, 10),
        phone,
        role: role || "customer",
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
      },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  const BodyParsed = LoginSchema.safeParse(req.body);
  if (!BodyParsed.success) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "INVALID_REQUEST",
    });
  }
  const { email, password } = BodyParsed.data;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_CREDENTIALS",
      });
    }
    const token = signToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
