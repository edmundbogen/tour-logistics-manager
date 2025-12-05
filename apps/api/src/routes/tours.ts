import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

const tourSchema = z.object({
  name: z.string().min(1),
  artistName: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  tourManagerName: z.string().optional(),
  tourManagerPhone: z.string().optional(),
  tourManagerEmail: z.string().email().optional().or(z.literal('')),
  productionContactName: z.string().optional(),
  productionContactPhone: z.string().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  managementName: z.string().optional(),
  managementPhone: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/tours - List all tours
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tours = await prisma.tour.findMany({
      include: {
        _count: {
          select: { shows: true }
        },
        shows: {
          select: {
            id: true,
            overallStatus: true,
            riskLevel: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    const toursWithStats = tours.map(tour => {
      const statusCounts = {
        notStarted: 0,
        inProgress: 0,
        confirmed: 0,
        completed: 0
      };

      tour.shows.forEach(show => {
        switch (show.overallStatus) {
          case 'Not Started':
            statusCounts.notStarted++;
            break;
          case 'In Progress':
            statusCounts.inProgress++;
            break;
          case 'Confirmed':
            statusCounts.confirmed++;
            break;
          case 'Completed':
            statusCounts.completed++;
            break;
        }
      });

      const { shows, ...tourData } = tour;
      return {
        ...tourData,
        showCount: tour._count.shows,
        statusCounts,
        riskCounts: {
          green: shows.filter(s => s.riskLevel === 'Green').length,
          yellow: shows.filter(s => s.riskLevel === 'Yellow').length,
          red: shows.filter(s => s.riskLevel === 'Red').length
        }
      };
    });

    res.json(toursWithStats);
  } catch (error) {
    next(error);
  }
});

// POST /api/tours - Create tour
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = tourSchema.parse(req.body);

    const tour = await prisma.tour.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      }
    });

    await prisma.activityLog.create({
      data: {
        tourId: tour.id,
        actionType: 'TOUR_CREATED',
        description: `Tour "${tour.name}" created`
      }
    });

    res.status(201).json(tour);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// GET /api/tours/:id - Get tour with shows summary
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: {
        shows: {
          orderBy: { showDate: 'asc' },
          include: {
            flights: true,
            hotels: true,
            groundTransports: true
          }
        },
        teamMembers: true
      }
    });

    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    res.json(tour);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tours/:id - Update tour
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = tourSchema.partial().parse(req.body);

    const tour = await prisma.tour.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      }
    });

    await prisma.activityLog.create({
      data: {
        tourId: tour.id,
        actionType: 'TOUR_UPDATED',
        description: `Tour "${tour.name}" updated`
      }
    });

    res.json(tour);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/tours/:id - Delete tour
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.tour.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/tours/:id/team - Get team members
router.get('/:id/team', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { tourId: req.params.id },
      orderBy: { name: 'asc' }
    });

    res.json(members);
  } catch (error) {
    next(error);
  }
});

// POST /api/tours/:id/team - Add team member
router.post('/:id/team', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.create({
      data: {
        tourId: req.params.id,
        ...req.body
      }
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

// GET /api/tours/:id/activity - Get activity log
router.get('/:id/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { tourId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
