import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// API Routes
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

// Debug endpoint to help diagnose path issues
app.get('/api/debug', async (req, res) => {
  const fs = await import('fs');
  const possiblePaths = [
    path.join(__dirname, '../../web/dist'),
    path.join(__dirname, '../../../apps/web/dist'),
    path.resolve(process.cwd(), '../web/dist'),
    path.resolve(process.cwd(), 'apps/web/dist'),
    '/opt/render/project/src/apps/web/dist'
  ];

  const results = possiblePaths.map(p => ({
    path: p,
    exists: fs.existsSync(p),
    hasIndex: fs.existsSync(path.join(p, 'index.html'))
  }));

  res.json({
    __dirname,
    cwd: process.cwd(),
    possiblePaths: results,
    env: process.env.NODE_ENV
  });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  // Frontend is copied to ./public during build
  const frontendPath = path.join(__dirname, '../public');
  console.log(`Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../public', 'index.html'));
    }
  });
}

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
