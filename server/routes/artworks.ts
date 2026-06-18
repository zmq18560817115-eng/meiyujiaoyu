import { Router } from 'express';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, optionalTeacher, optionalStudent, type AuthedRequest } from '../lib/auth.js';

const router = Router();

function getVisitorId(req: { headers: Record<string, unknown>; body?: { visitorId?: string } }) {
  const fromBody = req.body?.visitorId;
  if (typeof fromBody === 'string' && fromBody) return fromBody;
  const header = req.headers['x-visitor-id'];
  if (typeof header === 'string' && header) return header;
  return 'anonymous';
}

router.get('/', (_req, res) => {
  const { approved, page = '1', pageSize = '50' } = _req.query;
  const store = loadStore();
  let list = [...store.artworks];

  if (approved === 'true') list = list.filter((w) => w.approved);
  if (approved === 'false') list = list.filter((w) => !w.approved);

  list.sort((a, b) => (b.date > a.date ? 1 : -1));

  const p = Math.max(1, parseInt(String(page), 10) || 1);
  const ps = Math.min(100, parseInt(String(pageSize), 10) || 50);
  const start = (p - 1) * ps;
  const items = list.slice(start, start + ps);

  ok(res, {
    artworks: items,
    total: list.length,
    page: p,
    pageSize: ps,
  });
});

router.get('/:id', (req, res) => {
  const store = loadStore();
  const work = store.artworks.find((w) => w.id === req.params.id);
  if (!work) {
    fail(res, '作品不存在', 404, 404);
    return;
  }
  ok(res, { artwork: work });
});

router.post('/', optionalStudent, (req: AuthedRequest, res) => {
  const {
    title,
    studentName,
    grade,
    diary,
    tags,
    imageUrl,
    templateType,
    artworkData,
    approved,
  } = req.body;

  const resolvedName = studentName?.trim() || req.student?.name;
  const resolvedGrade = grade?.trim() || req.student?.grade;

  if (!resolvedName) {
    fail(res, '请填写学生署名或先登录学生账号');
    return;
  }

  const work = {
    id: newId('sw'),
    title:
      title?.trim() ||
      (templateType === 'butterfly' ? '彩绘双飞：我的蝴蝶扎染' : '富贵画卷：我的数字照壁'),
    studentName: resolvedName,
    grade: resolvedGrade || '双廊小学 创意生',
    studentId: req.student?.id,
    imageUrl:
      imageUrl ||
      '/gallery/sw-1-peony.png',
    likes: 0,
    hasLiked: false,
    date: new Date().toISOString().split('T')[0],
    tags: tags || ['数字白画', '人机设色', '大理传统'],
    diary: diary || '这是我在青墙粉绘系统的创作。',
    badge: undefined as string | undefined,
    approved: approved === true,
    templateType,
    artworkData,
  };

  mutateStore((s) => {
    s.artworks.unshift(work);
    s.stats.totalWorks = s.artworks.length;
  });

  ok(res, { artwork: work }, 201);
});

router.patch('/:id/approve', requireTeacher, (req: AuthedRequest, res) => {
  const { badge, approved = true } = req.body;
  let updated: (ReturnType<typeof loadStore>['artworks'][number]) | null = null;

  mutateStore((s) => {
    const idx = s.artworks.findIndex((w) => w.id === req.params.id);
    if (idx === -1) return;
    s.artworks[idx] = {
      ...s.artworks[idx],
      approved: approved !== false,
      badge: badge || s.artworks[idx].badge || '创意美育新星',
    };
    updated = s.artworks[idx];
  });

  if (!updated) {
    fail(res, '作品不存在', 404, 404);
    return;
  }
  ok(res, { artwork: updated });
});

router.post('/:id/likes', optionalTeacher, (req, res) => {
  const visitorId = getVisitorId(req);
  const store = loadStore();
  const work = store.artworks.find((w) => w.id === req.params.id);
  if (!work) {
    fail(res, '作品不存在', 404, 404);
    return;
  }

  const likedBy = store.artworkLikes[req.params.id] || [];
  if (likedBy.includes(visitorId)) {
    ok(res, {
      likes: work.likes,
      hasLiked: true,
      message: '已经点过赞啦',
    });
    return;
  }

  let result = { likes: work.likes, hasLiked: true };
  mutateStore((s) => {
    if (!s.artworkLikes[req.params.id]) s.artworkLikes[req.params.id] = [];
    s.artworkLikes[req.params.id].push(visitorId);
    const idx = s.artworks.findIndex((w) => w.id === req.params.id);
    if (idx !== -1) {
      s.artworks[idx].likes += 1;
      s.artworks[idx].hasLiked = true;
      result = { likes: s.artworks[idx].likes, hasLiked: true };
    }
  });

  ok(res, result);
});

export default router;
