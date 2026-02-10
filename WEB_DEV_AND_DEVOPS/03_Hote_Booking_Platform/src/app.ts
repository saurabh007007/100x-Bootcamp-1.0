import express from "express";
import authRoutes from "./routes/auth.routes";

export const app = express();

app.use(express.json());

//routes

app.use("api/auth", authRoutes);
