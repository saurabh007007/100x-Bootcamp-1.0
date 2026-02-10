import type { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== "customer") {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED",
      });
    }

    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !guests) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();

    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkIn >= checkOut ||
      checkIn < today
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_DATES",
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: {
          hotel: {
            select: {
              id: true,
              ownerId: true,
            },
          },
        },
      });

      if (!room) {
        throw { status: 404, code: "ROOM_NOT_FOUND" };
      }

      if (room.hotel.ownerId === userId) {
        throw { status: 403, code: "FORBIDDEN" };
      }

      if (guests > room.maxOccupancy) {
        throw { status: 400, code: "INVALID_CAPACITY" };
      }

      const overlappingBooking = await tx.booking.findFirst({
        where: {
          roomId,
          status: "confirmed",
          AND: [
            { checkInDate: { lt: checkOut } },
            { checkOutDate: { gt: checkIn } },
          ],
        },
      });

      if (overlappingBooking) {
        throw { status: 400, code: "ROOM_NOT_AVAILABLE" };
      }

      const nights =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

      const totalPrice = Number(room.pricePerNight) * nights;

      return await tx.booking.create({
        data: {
          userId,
          roomId,
          hotelId: room.hotel.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          totalPrice,
          status: "confirmed",
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: booking,
      error: null,
    });
  } catch (err: any) {
    if (err?.code && err?.status) {
      return res.status(err.status).json({
        success: false,
        data: null,
        error: err.code,
      });
    }

    console.error(err);

    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== "customer") {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED",
      });
    }

    const { status } = req.query;

    if (status && status !== "confirmed" && status !== "cancelled") {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: {
        bookingDate: "desc",
      },
      select: {
        id: true,
        roomId: true,
        hotelId: true,
        checkInDate: true,
        checkOutDate: true,
        guests: true,
        totalPrice: true,
        status: true,
        bookingDate: true,
        room: {
          select: {
            roomNumber: true,
            roomType: true,
          },
        },
        hotel: {
          select: {
            name: true,
          },
        },
      },
    });

    const response = bookings.map((b) => ({
      id: b.id,
      roomId: b.roomId,
      hotelId: b.hotelId,
      hotelName: b.hotel.name,
      roomNumber: b.room.roomNumber,
      roomType: b.room.roomType,
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      guests: b.guests,
      totalPrice: b.totalPrice,
      status: b.status,
      bookingDate: b.bookingDate,
    }));

    return res.status(200).json({
      success: true,
      data: response,
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== "customer") {
      return res.status(401).json({
        success: false,
        data: null,
        error: "UNAUTHORIZED",
      });
    }

    const bookingId = String(req.params.bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "NOT_FOUND",
      });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        data: null,
        error: "ALREADY_CANCELLED",
      });
    }

    const now = new Date();
    const diffInHours =
      (booking.checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "CANCELLATION_DEADLINE_PASSED",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        cancelledAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedBooking,
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
