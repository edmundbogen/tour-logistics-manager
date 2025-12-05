import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { calculateRiskLevel } from '../utils/riskCalculation.js';

const router = Router();

const flightSchema = z.object({
  originAirport: z.string().min(3).max(4),
  destinationAirport: z.string().min(3).max(4),
  optionNumber: z.number().min(1).max(3),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  departureDatetime: z.string().optional(),
  arrivalDatetime: z.string().optional(),
  isPrimary: z.boolean().optional(),
  isBackup: z.boolean().optional(),
  confirmationNumber: z.string().optional(),
  airlinePhone: z.string().optional(),
  price: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/shows/:showId/flights
router.get('/:showId/flights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { showId: req.params.showId },
      orderBy: { optionNumber: 'asc' }
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

// POST /api/shows/:showId/flights
router.post('/:showId/flights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = flightSchema.parse(req.body);

    // If marking as primary, unmark others
    if (data.isPrimary) {
      await prisma.flight.updateMany({
        where: { showId: req.params.showId },
        data: { isPrimary: false }
      });
    }

    const flight = await prisma.flight.create({
      data: {
        showId: req.params.showId,
        originAirport: data.originAirport.toUpperCase(),
        destinationAirport: data.destinationAirport.toUpperCase(),
        optionNumber: data.optionNumber,
        airline: data.airline,
        flightNumber: data.flightNumber,
        departureDatetime: data.departureDatetime ? new Date(data.departureDatetime) : null,
        arrivalDatetime: data.arrivalDatetime ? new Date(data.arrivalDatetime) : null,
        isPrimary: data.isPrimary || false,
        isBackup: data.isBackup || false,
        confirmationNumber: data.confirmationNumber,
        airlinePhone: data.airlinePhone,
        price: data.price,
        status: data.status || 'Not Booked',
        notes: data.notes
      }
    });

    // Recalculate risk level for the show
    const show = await prisma.show.findUnique({
      where: { id: req.params.showId },
      include: {
        flights: true,
        groundTransports: true
      }
    });

    if (show) {
      const riskLevel = calculateRiskLevel(show, show.flights, show.groundTransports[0]);
      await prisma.show.update({
        where: { id: req.params.showId },
        data: { riskLevel }
      });
    }

    res.status(201).json(flight);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// PUT /api/shows/:showId/flights/:id
router.put('/:showId/flights/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = flightSchema.partial().parse(req.body);

    // If marking as primary, unmark others
    if (data.isPrimary) {
      await prisma.flight.updateMany({
        where: {
          showId: req.params.showId,
          id: { not: req.params.id }
        },
        data: { isPrimary: false }
      });
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.departureDatetime) {
      updateData.departureDatetime = new Date(data.departureDatetime);
    }
    if (data.arrivalDatetime) {
      updateData.arrivalDatetime = new Date(data.arrivalDatetime);
    }

    const flight = await prisma.flight.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Recalculate risk level for the show
    const show = await prisma.show.findUnique({
      where: { id: req.params.showId },
      include: {
        flights: true,
        groundTransports: true
      }
    });

    if (show) {
      const riskLevel = calculateRiskLevel(show, show.flights, show.groundTransports[0]);
      await prisma.show.update({
        where: { id: req.params.showId },
        data: { riskLevel }
      });
    }

    res.json(flight);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/shows/:showId/flights/:id
router.delete('/:showId/flights/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.flight.delete({
      where: { id: req.params.id }
    });

    // Recalculate risk level for the show
    const show = await prisma.show.findUnique({
      where: { id: req.params.showId },
      include: {
        flights: true,
        groundTransports: true
      }
    });

    if (show) {
      const riskLevel = calculateRiskLevel(show, show.flights, show.groundTransports[0]);
      await prisma.show.update({
        where: { id: req.params.showId },
        data: { riskLevel }
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
