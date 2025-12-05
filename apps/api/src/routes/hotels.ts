import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = Router();

const hotelSchema = z.object({
  hotelName: z.string().min(1),
  hotelAddress: z.string().optional(),
  hotelPhone: z.string().optional(),
  confirmationNumber: z.string().optional(),
  checkInDate: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutDate: z.string().optional(),
  checkOutTime: z.string().optional(),
  roomType: z.string().optional(),
  distanceToVenueMinutes: z.number().optional(),
  distanceToAirportMinutes: z.number().optional(),
  pricePerNight: z.number().optional(),
  earlyCheckinAvailable: z.boolean().optional(),
  lateCheckoutAvailable: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.string().optional()
});

// GET /api/shows/:showId/hotel
router.get('/:showId/hotel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { showId: req.params.showId }
    });

    res.json(hotels);
  } catch (error) {
    next(error);
  }
});

// POST /api/shows/:showId/hotel
router.post('/:showId/hotel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = hotelSchema.parse(req.body);

    const hotel = await prisma.hotel.create({
      data: {
        showId: req.params.showId,
        hotelName: data.hotelName,
        hotelAddress: data.hotelAddress,
        hotelPhone: data.hotelPhone,
        confirmationNumber: data.confirmationNumber,
        checkInDate: data.checkInDate ? new Date(data.checkInDate) : null,
        checkInTime: data.checkInTime,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : null,
        checkOutTime: data.checkOutTime,
        roomType: data.roomType,
        distanceToVenueMinutes: data.distanceToVenueMinutes,
        distanceToAirportMinutes: data.distanceToAirportMinutes,
        pricePerNight: data.pricePerNight,
        earlyCheckinAvailable: data.earlyCheckinAvailable,
        lateCheckoutAvailable: data.lateCheckoutAvailable,
        notes: data.notes,
        status: data.status || 'Not Booked'
      }
    });

    res.status(201).json(hotel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// PUT /api/shows/:showId/hotel/:id
router.put('/:showId/hotel/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = hotelSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.checkInDate) {
      updateData.checkInDate = new Date(data.checkInDate);
    }
    if (data.checkOutDate) {
      updateData.checkOutDate = new Date(data.checkOutDate);
    }

    const hotel = await prisma.hotel.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(hotel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/shows/:showId/hotel/:id
router.delete('/:showId/hotel/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.hotel.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Calculate hotel score
router.get('/:showId/hotel/:id/score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id }
    });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    let score = 0;
    const breakdown: Record<string, number> = {};

    // Distance to venue (<20 min = +10 pts)
    if (hotel.distanceToVenueMinutes && hotel.distanceToVenueMinutes <= 20) {
      score += 10;
      breakdown['closeToVenue'] = 10;
    } else if (hotel.distanceToVenueMinutes && hotel.distanceToVenueMinutes <= 30) {
      score += 5;
      breakdown['closeToVenue'] = 5;
    }

    // Distance to airport (<30 min = +5 pts)
    if (hotel.distanceToAirportMinutes && hotel.distanceToAirportMinutes <= 30) {
      score += 5;
      breakdown['closeToAirport'] = 5;
    }

    // Early check-in (+5 pts)
    if (hotel.earlyCheckinAvailable) {
      score += 5;
      breakdown['earlyCheckin'] = 5;
    }

    // Late checkout (+5 pts)
    if (hotel.lateCheckoutAvailable) {
      score += 5;
      breakdown['lateCheckout'] = 5;
    }

    res.json({ score, maxScore: 25, breakdown });
  } catch (error) {
    next(error);
  }
});

export default router;
