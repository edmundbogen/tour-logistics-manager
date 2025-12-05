import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

import toursRouter from './routes/tours.js';
import showsRouter from './routes/shows.js';
import flightsRouter from './routes/flights.js';
import hotelsRouter from './routes/hotels.js';
import transportRouter from './routes/transport.js';
import checklistsRouter from './routes/checklists.js';
import exportsRouter from './routes/exports.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tours', toursRouter);
app.use('/api/tours', showsRouter);
app.use('/api/shows', flightsRouter);
app.use('/api/shows', hotelsRouter);
app.use('/api/shows', transportRouter);
app.use('/api/shows', checklistsRouter);
app.use('/api', exportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
