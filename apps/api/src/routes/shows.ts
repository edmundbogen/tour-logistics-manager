import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { calculateRiskLevel } from '../utils/riskCalculation.js';

const router = Router();

const showSchema = z.object({
  showNumber: z.number().optional(),
  city: z.string().min(1),
  stateCountry: z.string().optional(),
  venueName: z.string().min(1),
  venueAddress: z.string().optional(),
  showDate: z.string(),
  onStageTime: z.string().optional(),
  setLengthMinutes: z.number().optional(),
  doorsTime: z.string().optional(),
  curfewTime: z.string().optional(),
  requiredOnSiteTime: z.string(),
  soundcheckTime: z.string().optional(),
  soundcheckDurationMinutes: z.number().optional(),
  loadInTime: z.string().optional(),
  venueContactName: z.string().optional(),
  venueContactEmail: z.string().email().optional().or(z.literal('')),
  venueContactPhone: z.string().optional(),
  dayOfContactName: z.string().optional(),
  dayOfContactPhone: z.string().optional(),
  productionContactName: z.string().optional(),
  productionContactPhone: z.string().optional(),
  parkingInstructions: z.string().optional(),
  credentialsProcess: z.string().optional(),
  greenRoomInfo: z.string().optional(),
  cateringInfo: z.string().optional(),
  wifiInfo: z.string().optional(),
  venueCapacity: z.number().optional(),
  ageRestriction: z.string().optional(),
  guarantee: z.number().optional(),
  doorSplit: z.string().optional(),
  merchSplit: z.string().optional(),
  settlementTime: z.string().optional(),
  depositReceived: z.boolean().optional(),
  depositAmount: z.number().optional(),
  overallStatus: z.string().optional(),
  venueStatus: z.string().optional(),
  riskLevel: z.string().optional(),
  riskNotes: z.string().optional(),
  backupPlan: z.string().optional(),
  specialNotes: z.string().optional(),
  postShowNotes: z.string().optional()
});

// GET /api/tours/:tourId/shows - List shows for tour
router.get('/:tourId/shows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shows = await prisma.show.findMany({
      where: { tourId: req.params.tourId },
      include: {
        flights: true,
        hotels: true,
        groundTransports: true
      },
      orderBy: { showDate: 'asc' }
    });

    // Calculate risk level for each show
    const showsWithRisk = shows.map(show => ({
      ...show,
      calculatedRiskLevel: calculateRiskLevel(show, show.flights, show.groundTransports[0])
    }));

    res.json(showsWithRisk);
  } catch (error) {
    next(error);
  }
});

// POST /api/tours/:tourId/shows - Create show
router.post('/:tourId/shows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = showSchema.parse(req.body);

    // Auto-assign show number
    const existingShows = await prisma.show.count({
      where: { tourId: req.params.tourId }
    });

    const show = await prisma.show.create({
      data: {
        tourId: req.params.tourId,
        showNumber: data.showNumber || existingShows + 1,
        city: data.city,
        stateCountry: data.stateCountry,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        showDate: new Date(data.showDate),
        onStageTime: data.onStageTime,
        setLengthMinutes: data.setLengthMinutes,
        doorsTime: data.doorsTime,
        curfewTime: data.curfewTime,
        requiredOnSiteTime: data.requiredOnSiteTime,
        soundcheckTime: data.soundcheckTime,
        soundcheckDurationMinutes: data.soundcheckDurationMinutes,
        loadInTime: data.loadInTime,
        venueContactName: data.venueContactName,
        venueContactEmail: data.venueContactEmail,
        venueContactPhone: data.venueContactPhone,
        dayOfContactName: data.dayOfContactName,
        dayOfContactPhone: data.dayOfContactPhone,
        productionContactName: data.productionContactName,
        productionContactPhone: data.productionContactPhone,
        parkingInstructions: data.parkingInstructions,
        credentialsProcess: data.credentialsProcess,
        greenRoomInfo: data.greenRoomInfo,
        cateringInfo: data.cateringInfo,
        wifiInfo: data.wifiInfo,
        venueCapacity: data.venueCapacity,
        ageRestriction: data.ageRestriction,
        guarantee: data.guarantee,
        doorSplit: data.doorSplit,
        merchSplit: data.merchSplit,
        settlementTime: data.settlementTime,
        depositReceived: data.depositReceived,
        depositAmount: data.depositAmount,
        overallStatus: data.overallStatus || 'Not Started',
        venueStatus: data.venueStatus || 'Pending',
        riskLevel: data.riskLevel || 'Green',
        riskNotes: data.riskNotes,
        backupPlan: data.backupPlan,
        specialNotes: data.specialNotes,
        postShowNotes: data.postShowNotes
      }
    });

    await prisma.activityLog.create({
      data: {
        tourId: req.params.tourId,
        showId: show.id,
        actionType: 'SHOW_CREATED',
        description: `Show in ${show.city} at ${show.venueName} created`
      }
    });

    res.status(201).json(show);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// GET /api/tours/:tourId/shows/:id - Get show with all related data
router.get('/:tourId/shows/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: req.params.id },
      include: {
        tour: true,
        flights: {
          orderBy: { optionNumber: 'asc' }
        },
        hotels: true,
        groundTransports: true,
        checklists: {
          include: {
            template: true
          }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!show) {
      throw new AppError('Show not found', 404);
    }

    // Calculate risk level
    const calculatedRiskLevel = calculateRiskLevel(
      show,
      show.flights,
      show.groundTransports[0]
    );

    res.json({
      ...show,
      calculatedRiskLevel
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tours/:tourId/shows/:id - Update show
router.put('/:tourId/shows/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = showSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.showDate) {
      updateData.showDate = new Date(data.showDate);
    }

    const show = await prisma.show.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        flights: true,
        groundTransports: true
      }
    });

    // Recalculate risk level
    const calculatedRiskLevel = calculateRiskLevel(
      show,
      show.flights,
      show.groundTransports[0]
    );

    // Update risk level if changed
    if (calculatedRiskLevel !== show.riskLevel) {
      await prisma.show.update({
        where: { id: req.params.id },
        data: { riskLevel: calculatedRiskLevel }
      });
    }

    await prisma.activityLog.create({
      data: {
        tourId: req.params.tourId,
        showId: show.id,
        actionType: 'SHOW_UPDATED',
        description: `Show in ${show.city} updated`
      }
    });

    res.json({ ...show, riskLevel: calculatedRiskLevel });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/tours/:tourId/shows/:id - Delete show
router.delete('/:tourId/shows/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.show.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tours/:tourId/shows/:id/status - Quick status update
router.patch('/:tourId/shows/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { overallStatus, venueStatus, riskLevel } = req.body;

    const show = await prisma.show.update({
      where: { id: req.params.id },
      data: {
        ...(overallStatus && { overallStatus }),
        ...(venueStatus && { venueStatus }),
        ...(riskLevel && { riskLevel })
      }
    });

    await prisma.activityLog.create({
      data: {
        tourId: req.params.tourId,
        showId: show.id,
        actionType: 'STATUS_UPDATED',
        description: `Status updated to ${overallStatus || venueStatus || riskLevel}`
      }
    });

    res.json(show);
  } catch (error) {
    next(error);
  }
});

export default router;
