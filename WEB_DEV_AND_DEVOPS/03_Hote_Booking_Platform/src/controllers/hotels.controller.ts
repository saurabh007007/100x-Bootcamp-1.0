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
        amenities: amenities ?? [],
        ownerId: req.user!.userId,
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newHotel.id,
        ownerId: newHotel.ownerId,
        name: newHotel.name,
        description: newHotel.description,
        city: newHotel.city,
        country: newHotel.country,
        amenities: newHotel.amenities,
        rating: Number(newHotel.rating),
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
        pricePerNight: Number(newRoom.pricePerNight),
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

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const { city, country, minPrice, maxPrice } = req.query;

    const where: any = {};
    if (city) where.city = { equals: city as string, mode: "insensitive" };
    if (country)
      where.country = { equals: country as string, mode: "insensitive" };

    const hotels = await prisma.hotel.findMany({
      where,
      include: { rooms: true },
    });

    let result = hotels.map((hotel) => {
      const minPricePerNight =
        hotel.rooms.length > 0
          ? Math.min(...hotel.rooms.map((r) => Number(r.pricePerNight)))
          : 0;
      return {
        id: hotel.id,
        ownerId: hotel.ownerId,
        name: hotel.name,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        amenities: hotel.amenities,
        rating: Number(hotel.rating),
        totalReviews: hotel.totalReviews,
        minPricePerNight,
      };
    });

    if (minPrice) {
      result = result.filter(
        (h) => h.minPricePerNight >= Number(minPrice),
      );
    }
    if (maxPrice) {
      result = result.filter(
        (h) => h.minPricePerNight <= Number(maxPrice),
      );
    }

    return res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: { rooms: true },
    });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "HOTEL_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...hotel,
        rating: Number(hotel.rating),
        rooms: hotel.rooms.map((r) => ({
          ...r,
          pricePerNight: Number(r.pricePerNight),
        })),
      },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
