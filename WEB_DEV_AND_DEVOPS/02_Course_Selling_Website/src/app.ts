import express from "express";

import authRoutes from "./routes/auth.route";

export const app = express();

app.use(express.json());

//routes

app.use("/auth", authRoutes);
