import type { Request, Response } from "express";
import { HotelSchema, RoomSchema } from "../validation/SchemaValidation";
import { prisma } from "../db/prisma";

export const createHotels = async (req: Request, res: Response) => {
  try {
    const bodyParse = HotelSchema.safeParse(req.body);
    if (!bodyParse.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }
    const { name, description, city, country, amenities } = bodyParse.data;
    const newHotel = await prisma.hotel.create({
      data: {
        name,
        description,
        city,
        country,
        amenities,
        ownerId: req.user!.userId,
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newHotel.id,
        name: newHotel.name,
        description: newHotel.description,
        city: newHotel.city,
        country: newHotel.country,
        amenities: newHotel.amenities,
        rating: newHotel.rating,
        totalReviews: newHotel.totalReviews,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createRooms = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const bodyParse = RoomSchema.safeParse(req.body);
  console.log("Parsed body:", bodyParse);
  if (!bodyParse.success) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "INVALID_REQUEST",
    });
  }
  const { roomNumber, roomType, pricePerNight, maxOccupancy } = bodyParse.data;

  try {
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: id },
    });
    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "HOTEL_NOT_FOUND",
      });
    }
    const existingRoom = await prisma.room.findFirst({
      where: { roomNumber: roomNumber, hotelId: id },
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "ROOM_ALREADY_EXISTS",
      });
    }
    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        roomType,
        pricePerNight,
        maxOccupancy,
        hotelId: id,
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newRoom.id,
        roomNumber: newRoom.roomNumber,
        roomType: newRoom.roomType,
        pricePerNight: newRoom.pricePerNight,
        maxOccupancy: newRoom.maxOccupancy,
        hotelId: newRoom.hotelId,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHotelsWithAllRoomsWithHotelId = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = String(req.params.id);
    const hotel = await prisma.hotel.findUnique({
      where: { id: id },
      include: {
        rooms: true,
      },
    });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "HOTEL_NOT_FOUND",
      });
    }

    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: true,
      },
    });
    return res.status(200).json({
      success: true,
      data: hotels,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching hotels with rooms:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
