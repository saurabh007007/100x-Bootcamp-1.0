import express from "express";
import authRoutes from "./routes/auth.routes";
import { CheckProfile } from "./controllers/auth.controller";
import hotelRoutes from "./routes/hotels.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
export const app = express();

app.use(express.json());

//routes

app.use("/api/auth", authRoutes);
app.use("/me", CheckProfile);

app.use("/api/hotels", hotelRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/reviews", reviewRoutes);
