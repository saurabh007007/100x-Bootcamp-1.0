import express from "express";

import authRoutes from "./routes/auth.route";
import courseRoutes from "./routes/course.route";

export const app = express();

app.use(express.json());

//routes

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
