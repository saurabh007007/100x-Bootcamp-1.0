import express from "express";
import authRoutes from "./routes/auth.routes";
import { CheckProfile } from "./controllers/auth.controller";

export const app = express();

app.use(express.json());

//routes

app.use("/api/auth", authRoutes);
app.use("/me", CheckProfile);
