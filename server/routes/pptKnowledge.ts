import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import {
  ensurePptKnowledgeAssets,
  PPT_KNOWLEDGE_ASSETS_DIR,
  type PptKnowledgeEntryRecord,
} from '../lib/pptKnowledge.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';

const router = Router();

function toClientManifest(store: ReturnType<typeof loadStore>) {
  return {
    version: store.pptKnowledge.version,
    entries: store.pptKnowledge.entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      keywords: entry.keywords,
      theoryContent: entry.theoryContent,
      images: entry.images.map((img) => ({
        path: `/api/ppt-knowledge/assets/${img.assetId}`,
        caption: img.caption,
        assetId: img.assetId,
      })),
    })),
  };
}

router.get('/', (_req, res) => {
  ensurePptKnowledgeAssets();
  const store = loadStore();
  ok(res, toClientManifest(store));
});

router.get('/entries', (_req, res) => {
  const store = loadStore();
  ok(res, { entries: store.pptKnowledge.entries });
});

router.get('/entries/:id', (req, res) => {
  const store = loadStore();
  const entry = store.pptKnowledge.entries.find((e) => e.id === req.params.id);
  if (!entry) {
    fail(res, '知识条目不存在', 404, 404);
    return;
  }
  ok(res, { entry });
});

router.get('/assets/:assetId', (req, res) => {
  ensurePptKnowledgeAssets();
  const assetId = path.basename(req.params.assetId);
  const filePath = path.join(PPT_KNOWLEDGE_ASSETS_DIR, assetId);
  if (!fs.existsSync(filePath)) {
    const withExt = path.join(PPT_KNOWLEDGE_ASSETS_DIR, `${assetId}.svg`);
    if (fs.existsSync(withExt)) {
      res.type('image/svg+xml');
      res.sendFile(withExt);
      return;
    }
    fail(res, '素材文件不存在', 404, 404);
    return;
  }
  res.sendFile(filePath);
});

router.post('/entries', requireTeacher, (req: AuthedRequest, res) => {
  const { title, keywords, theoryContent, images } = req.body as {
    title?: string;
    keywords?: string[];
    theoryContent?: string;
    images?: PptKnowledgeEntryRecord['images'];
  };

  if (!title?.trim() || !Array.isArray(keywords) || keywords.length === 0) {
    fail(res, '标题与关键词不能为空');
    return;
  }

  const now = new Date().toISOString();
  const entry: PptKnowledgeEntryRecord = {
    id: newId('ppt-k'),
    title: title.trim(),
    keywords: keywords.map((k) => String(k).trim()).filter(Boolean),
    theoryContent: theoryContent?.trim() || '',
    images: Array.isArray(images) ? images : [],
    createdAt: now,
    updatedAt: now,
  };

  mutateStore((s) => {
    s.pptKnowledge.entries.unshift(entry);
  });

  ok(res, { entry }, 201);
});

export default router;
