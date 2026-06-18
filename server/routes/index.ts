import type { Express } from 'express';
import type { GoogleGenAI } from '@google/genai';
import authRouter from './auth.js';
import coursesRouter from './courses.js';
import resourcesRouter from './resources.js';
import artworksRouter from './artworks.js';
import uploadsRouter from './uploads.js';
import dashboardRouter from './dashboard.js';
import panoramaRouter from './panorama.js';
import { createWhiteboardRouter } from './whiteboard.js';
import { createAiRouter } from './ai.js';
import pptKnowledgeRouter from './pptKnowledge.js';
import { loadStore } from '../lib/store.js';
import { ok } from '../lib/response.js';

export function registerApiRoutes(app: Express, ai: GoogleGenAI | null) {
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/resources', resourcesRouter);
  app.use('/api/artworks', artworksRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/panorama', panoramaRouter);
  app.use('/api/whiteboards', createWhiteboardRouter(ai));
  app.use('/api/ppt-knowledge', pptKnowledgeRouter);
  app.use('/api', createAiRouter(ai));

  app.get('/api/announcements', (_req, res) => {
    ok(res, { announcements: loadStore().announcements });
  });

  app.get('/api/stats/pride-index', (_req, res) => {
    const store = loadStore();
    ok(res, {
      prideIndex: store.stats.prideScore ?? 89.4,
      level: '极优',
    });
  });

  app.get('/api/bootstrap/student', (_req, res) => {
    const store = loadStore();
    ok(res, {
      artworks: store.artworks.filter((w) => w.approved),
      hotspots: store.hotspots,
      projection: store.projection,
      prideIndex: store.stats.prideScore ?? 89.4,
    });
  });

  app.get('/api/bootstrap/teacher', (_req, res) => {
    const store = loadStore();
    ok(res, {
      courses: store.courses,
      resources: store.resources,
      artworks: store.artworks,
      announcements: store.announcements,
      schedules: store.schedules,
      stats: store.stats,
      hotspots: store.hotspots,
      projection: store.projection,
    });
  });
}
