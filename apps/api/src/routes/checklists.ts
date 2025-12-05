import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { z } from 'zod';

const router = Router();

// GET /api/shows/:showId/checklists
router.get('/:showId/checklists', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checklists = await prisma.checklistInstance.findMany({
      where: { showId: req.params.showId },
      include: {
        template: true
      }
    });

    res.json(checklists);
  } catch (error) {
    next(error);
  }
});

// POST /api/shows/:showId/checklists - Create from template
router.post('/:showId/checklists', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.body;

    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const items = template.items as Array<{ id: string; text: string; completed: boolean }>;

    const checklist = await prisma.checklistInstance.create({
      data: {
        showId: req.params.showId,
        templateId: templateId,
        items: items.map(item => ({ ...item, completed: false })),
        completedCount: 0,
        totalCount: items.length
      },
      include: {
        template: true
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/checklists/:id/items/:itemId - Toggle item
router.patch('/checklists/:id/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checklist = await prisma.checklistInstance.findUnique({
      where: { id: req.params.id }
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const items = checklist.items as Array<{ id: string; text: string; completed: boolean }>;
    const itemIndex = items.findIndex(item => item.id === req.params.itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items[itemIndex].completed = !items[itemIndex].completed;
    const completedCount = items.filter(item => item.completed).length;

    const updated = await prisma.checklistInstance.update({
      where: { id: req.params.id },
      data: {
        items,
        completedCount
      },
      include: {
        template: true
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// GET /api/checklist-templates - Get all templates
router.get('/checklist-templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      orderBy: { category: 'asc' }
    });

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

export default router;
