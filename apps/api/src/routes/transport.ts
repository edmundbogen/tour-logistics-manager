import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';
import { calculateRiskLevel } from '../utils/riskCalculation.js';

const router = Router();

const transportSchema = z.object({
  transportType: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  driverCompany: z.string().optional(),
  confirmationNumber: z.string().optional(),
  pickupLocation: z.string().optional(),
  pickupDatetime: z.string().optional(),
  vehicleType: z.string().optional(),
  airportToVenueMinutes: z.number().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  status: z.string().optional()
});

// GET /api/shows/:showId/transport
router.get('/:showId/transport', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transports = await prisma.groundTransport.findMany({
      where: { showId: req.params.showId }
    });

    res.json(transports);
  } catch (error) {
    next(error);
  }
});

// POST /api/shows/:showId/transport
router.post('/:showId/transport', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = transportSchema.parse(req.body);

    const transport = await prisma.groundTransport.create({
      data: {
        showId: req.params.showId,
        transportType: data.transportType,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        driverCompany: data.driverCompany,
        confirmationNumber: data.confirmationNumber,
        pickupLocation: data.pickupLocation,
        pickupDatetime: data.pickupDatetime ? new Date(data.pickupDatetime) : null,
        vehicleType: data.vehicleType,
        airportToVenueMinutes: data.airportToVenueMinutes,
        price: data.price,
        notes: data.notes,
        status: data.status || 'Not Booked'
      }
    });

    // Recalculate risk level
    const show = await prisma.show.findUnique({
      where: { id: req.params.showId },
      include: {
        flights: true,
        groundTransports: true
      }
    });

    if (show) {
      const riskLevel = calculateRiskLevel(show, show.flights, transport);
      await prisma.show.update({
        where: { id: req.params.showId },
        data: { riskLevel }
      });
    }

    res.status(201).json(transport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// PUT /api/shows/:showId/transport/:id
router.put('/:showId/transport/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = transportSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.pickupDatetime) {
      updateData.pickupDatetime = new Date(data.pickupDatetime);
    }

    const transport = await prisma.groundTransport.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Recalculate risk level
    const show = await prisma.show.findUnique({
      where: { id: req.params.showId },
      include: {
        flights: true,
        groundTransports: true
      }
    });

    if (show) {
      const riskLevel = calculateRiskLevel(show, show.flights, transport);
      await prisma.show.update({
        where: { id: req.params.showId },
        data: { riskLevel }
      });
    }

    res.json(transport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/shows/:showId/transport/:id
router.delete('/:showId/transport/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.groundTransport.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
