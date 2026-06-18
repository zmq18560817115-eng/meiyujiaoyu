import { Router } from 'express';
import { loadStore } from '../lib/store.js';
import { ok } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';

const router = Router();

router.get('/teacher', requireTeacher, (_req: AuthedRequest, res) => {
  const store = loadStore();
  const pendingReviews = store.artworks.filter((w) => !w.approved).length;

  ok(res, {
    activeStudents: store.stats.activeStudents,
    completionRate: store.stats.completionRate,
    totalWorks: store.artworks.length,
    pendingReviews,
    prideScore: store.stats.prideScore ?? 89.4,
    masteryScores: store.stats.masteryScores,
    rankList: store.stats.rankList,
    galleryCount: store.artworks.filter((w) => w.approved).length,
  });
});

router.get('/announcements', (_req, res) => {
  const store = loadStore();
  ok(res, { announcements: store.announcements });
});

router.get('/schedules/today', requireTeacher, (_req: AuthedRequest, res) => {
  const store = loadStore();
  ok(res, { schedules: store.schedules });
});

export default router;
