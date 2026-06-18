import { Router } from 'express';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { type } = req.query;
  const store = loadStore();
  let list = store.resources;
  if (type && typeof type === 'string') {
    list = list.filter((r) => r.type === type);
  }
  ok(res, { resources: list });
});

router.get('/:id', (req, res) => {
  const store = loadStore();
  const resource = store.resources.find((r) => r.id === req.params.id);
  if (!resource) {
    fail(res, '资源不存在', 404, 404);
    return;
  }
  ok(res, { resource, previewUrl: resource.previewUrl || null });
});

router.post('/', requireTeacher, (req: AuthedRequest, res) => {
  const { title, type, fileType, size, previewUrl } = req.body;
  if (!title?.trim()) {
    fail(res, '资源标题不能为空');
    return;
  }

  const resource = {
    id: newId('res'),
    title: title.trim(),
    type: type || 'local',
    size: size || '4.2 MB',
    date: new Date().toISOString().split('T')[0],
    fileType: fileType || 'pdf',
    downloads: 0,
    previewUrl,
  };

  mutateStore((s) => {
    s.resources.unshift(resource);
  });

  ok(res, { resource }, 201);
});

router.post('/:id/download', (req, res) => {
  let resource: (ReturnType<typeof loadStore>['resources'][number]) | null = null;
  mutateStore((s) => {
    const idx = s.resources.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return;
    s.resources[idx].downloads += 1;
    resource = s.resources[idx];
  });

  if (!resource) {
    fail(res, '资源不存在', 404, 404);
    return;
  }
  ok(res, { resource, downloadUrl: resource.previewUrl || null });
});

export default router;
