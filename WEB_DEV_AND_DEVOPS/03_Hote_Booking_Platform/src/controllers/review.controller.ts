import type { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const createReview = async (req: Request, res: Response) => {
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

    const { bookingId, rating, comment } = req.body;

    // ---- Basic validation
    if (!bookingId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "INVALID_REQUEST",
      });
    }

    const now = new Date();

    const review = await prisma.$transaction(async (tx) => {
      // ---- Fetch booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          review: true,
          hotel: {
            select: {
              id: true,
              rating: true,
              totalReviews: true,
            },
          },
        },
      });

      if (!booking) {
        throw { status: 404, code: "BOOKING_NOT_FOUND" };
      }

      // ---- Ownership check
      if (booking.userId !== userId) {
        throw { status: 403, code: "FORBIDDEN" };
      }

      // ---- Already reviewed
      if (booking.review) {
        throw { status: 400, code: "ALREADY_REVIEWED" };
      }

      // ---- Booking eligibility
      if (booking.status !== "confirmed" || booking.checkOutDate > now) {
        throw { status: 400, code: "BOOKING_NOT_ELIGIBLE" };
      }

      // ---- Create review
      const createdReview = await tx.review.create({
        data: {
          userId,
          hotelId: booking.hotelId,
          bookingId,
          rating,
          comment,
        },
      });

      // ---- Update hotel rating
      const oldRating = Number(booking.hotel.rating);
      const totalReviews = booking.hotel.totalReviews;

      const newRating =
        (oldRating * totalReviews + rating) / (totalReviews + 1);

      await tx.hotel.update({
        where: { id: booking.hotelId },
        data: {
          rating: newRating,
          totalReviews: totalReviews + 1,
        },
      });

      return createdReview;
    });

    return res.status(201).json({
      success: true,
      data: review,
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
