import express from "express";

import authRoutes from "./routes/auth.route";
import courseRoutes from "./routes/course.route";
import lessionsRoutes from "./routes/lessions.route";
import { getProfile } from "./controllers/auth.controller";
import { authMiddleware } from "./middleware/auth.middlewrae";

export const app = express();

app.use(express.json());

//routes

app.use("/auth", authRoutes);
app.use("/me", authMiddleware, getProfile);
app.use("/profile", authMiddleware, getProfile);
app.use("/courses", courseRoutes);
app.use("/lessons", lessionsRoutes);
app.use("/lessions", lessionsRoutes);
