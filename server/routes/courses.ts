import { Router } from 'express';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  const store = loadStore();
  let list = store.courses;
  if (category && typeof category === 'string') {
    list = list.filter((c) => c.category === category);
  }
  ok(res, { courses: list });
});

router.get('/:id', (req, res) => {
  const store = loadStore();
  const course = store.courses.find((c) => c.id === req.params.id);
  if (!course) {
    fail(res, '课程不存在', 404, 404);
    return;
  }
  ok(res, { course });
});

router.post('/', requireTeacher, (req: AuthedRequest, res) => {
  const body = req.body;
  if (!body.title?.trim()) {
    fail(res, '课程标题不能为空');
    return;
  }

  const course = {
    id: body.id || newId('c'),
    title: body.title,
    category: body.category || 'motif',
    desc: body.desc || '',
    duration: body.duration || '15分钟精讲',
    difficulty: body.difficulty || '进阶',
    isLocal: body.isLocal ?? true,
    outline: body.outline || [],
    materials: body.materials || [],
    bannerUrl: body.bannerUrl,
  };

  mutateStore((s) => {
    s.courses.unshift(course);
  });

  ok(res, { course }, 201);
});

router.patch('/:id', requireTeacher, (req: AuthedRequest, res) => {
  let updated: (typeof loadStore extends () => infer S ? S : never)['courses'][number] | null = null;
  mutateStore((s) => {
    const idx = s.courses.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return;
    s.courses[idx] = { ...s.courses[idx], ...req.body, id: s.courses[idx].id };
    updated = s.courses[idx];
  });

  if (!updated) {
    fail(res, '课程不存在', 404, 404);
    return;
  }
  ok(res, { course: updated });
});

router.delete('/:id', requireTeacher, (req: AuthedRequest, res) => {
  let removed = false;
  mutateStore((s) => {
    const before = s.courses.length;
    s.courses = s.courses.filter((c) => c.id !== req.params.id);
    removed = s.courses.length < before;
  });

  if (!removed) {
    fail(res, '课程不存在', 404, 404);
    return;
  }
  ok(res, { deleted: true });
});

export default router;
