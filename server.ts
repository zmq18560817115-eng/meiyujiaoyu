/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { registerApiRoutes } from './server/routes/index.js';
import { ensureUploadsDir, UPLOADS_DIR } from './server/lib/store.js';
import { loadStore } from './server/lib/store.js';
import { attachProjectionWebSocket } from './server/lib/projectionWs.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '15mb' }));

const PORT = Number(process.env.PORT) || 3000;

let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== 'MY_GEMINI_API_KEY' && api_key !== '') {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
    console.log('GoogleGenAI initialized successfully.');
  } catch (error) {
    console.error('Initialization of GoogleGenAI failed:', error);
  }
} else {
  console.log('No valid GEMINI_API_KEY. AI endpoints use offline fallbacks.');
}

loadStore();
ensureUploadsDir();
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/exports', express.static(path.join(process.cwd(), 'exports')));

registerApiRoutes(app, ai);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Configuring Vite Dev Server Middlewares...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Production serving static compilation...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return;
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = createServer(app);
  attachProjectionWebSocket(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
