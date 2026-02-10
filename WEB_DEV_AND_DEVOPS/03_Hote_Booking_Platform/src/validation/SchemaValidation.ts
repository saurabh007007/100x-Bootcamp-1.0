import { check, z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(3, "Name must be greater then 3 chracter"),
  email: z.string().email("Invalid Email address"),
  password: z.string().min(5, "Minimum 5 character in passsword"),
  phone: z.string().optional(),
  role: z
    .enum(["customer", "owner"], "Role must be either customer or owner")
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid Email Adress"),
  password: z.string().min(5, "At least 5 character password"),
});

export const HotelSchema = z.object({
  name: z.string().min(3, "Hotel name must be greater then 3 character"),
  description: z
    .string()
    .min(10, "Description must be greater then 10 character"),
  city: z.string().min(3, "City name must be greater then 3 character"),
  country: z.string().min(3, "Country name must be greater then 3 character"),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
});

export const RoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.string().min(3, "Room type must be greater then 3 character"),
  pricePerNight: z
    .number()
    .positive("Price per night must be a positive number"),
  maxOccupancy: z.number().positive("Max occupancy must be a positive number"),
});

export const BookingSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid check-in date format",
  }),
  checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid check-out date format",
  }),
  guests: z.number().positive("Number of guests must be a positive number"),
  totalPrice: z
    .number()
    .positive("Total price must be a positive number")
    .optional(),
});
