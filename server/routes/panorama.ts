import { Router } from 'express';
import { loadStore, mutateStore } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';
import {
  broadcastProjection,
  getLabStatusPayload,
  refreshLabConnections,
} from '../lib/projectionWs.js';

const router = Router();

router.get('/hotspots', (req, res) => {
  const { sceneId = 'xiyuan' } = req.query;
  const store = loadStore();
  const hotspots = store.hotspots.filter((h) => h.sceneId === sceneId);
  ok(res, {
    sceneId,
    hotspots,
    scene: {
      id: sceneId,
      name: '喜洲严家大院示范场景',
      thumbnailUrl: null,
    },
  });
});

router.get('/hotspots/:id', (req, res) => {
  const store = loadStore();
  const spot = store.hotspots.find((h) => h.id === req.params.id);
  if (!spot) {
    fail(res, '热点不存在', 404, 404);
    return;
  }
  ok(res, { hotspot: spot });
});

router.get('/projection', (_req, res) => {
  const store = loadStore();
  ok(res, { projection: store.projection });
});

router.get('/lab-status', requireTeacher, (_req, res) => {
  ok(res, getLabStatusPayload());
});

router.post('/lab-refresh', requireTeacher, async (_req, res) => {
  const payload = await refreshLabConnections();
  ok(res, payload);
});

router.post('/projection', requireTeacher, (req: AuthedRequest, res) => {
  const { hotspotId, active = true } = req.body;
  if (!hotspotId) {
    fail(res, '缺少 hotspotId');
    return;
  }
  broadcastProjection(hotspotId, active !== false);
  const store = loadStore();
  ok(res, { projection: store.projection });
});

export default router;
