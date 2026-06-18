import fs from 'fs';
import { ensureAccountRoster } from './accounts.js';
import { ensurePptKnowledgeAssets, mergePptKnowledgeStore } from './pptKnowledge.js';
import { createDefaultStore, type DataStore } from '../seed.js';
import { INITIAL_STUDENT_WORKS } from '../../src/data/mockData.js';
import { DATA_DIR, STORE_PATH, UPLOADS_DIR } from './storePaths.js';

let cache: DataStore | null = null;

/** 启动时把预置学生作品的本地画廊图同步进 store，避免旧 unsplash 占位回写 */
function syncBuiltinArtworkImages(artworks: DataStore['artworks']) {
  const galleryById = new Map(
    INITIAL_STUDENT_WORKS.filter((w) => w.imageUrl?.startsWith('/gallery/'))
      .map((w) => [w.id, w.imageUrl] as const),
  );
  if (galleryById.size === 0) return artworks;
  return artworks.map((work) => {
    const localUrl = galleryById.get(work.id);
    if (!localUrl) return work;
    if (work.imageUrl === localUrl) return work;
    return { ...work, imageUrl: localUrl };
  });
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadStore(): DataStore {
  if (cache) return cache;
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    cache = createDefaultStore();
    ensurePptKnowledgeAssets();
    saveStore();
    return cache;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as DataStore;
    const defaults = createDefaultStore();
    cache = {
      ...defaults,
      ...parsed,
      teachers: parsed.teachers?.length ? parsed.teachers : defaults.teachers,
      students: parsed.students?.length ? parsed.students : defaults.students,
      studentSessions: parsed.studentSessions ?? defaults.studentSessions,
      projection: { ...defaults.projection, ...parsed.projection },
      pptKnowledge: mergePptKnowledgeStore(parsed.pptKnowledge),
      artworks: syncBuiltinArtworkImages(
        parsed.artworks?.length ? parsed.artworks : defaults.artworks,
      ),
    };
    ensureAccountRoster(cache);
    ensurePptKnowledgeAssets();
    saveStore();
    return cache;
  } catch {
    cache = createDefaultStore();
    ensurePptKnowledgeAssets();
    saveStore();
    return cache;
  }
}

export function saveStore() {
  if (!cache) return;
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

export function mutateStore(mutator: (store: DataStore) => void) {
  const store = loadStore();
  mutator(store);
  saveStore();
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export { UPLOADS_DIR } from './storePaths.js';

export function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
