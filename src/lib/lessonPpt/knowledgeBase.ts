import type { PptKnowledgeEntry, PptKnowledgeManifest } from "./types";
import { KNOWLEDGE_BASE_URL } from "./manifest";

let cachedManifest: PptKnowledgeManifest | null = null;

const EMPTY_MANIFEST: PptKnowledgeManifest = { version: 1, entries: [] };

function parseApiPayload(json: unknown): PptKnowledgeManifest {
  const data = json as { data?: PptKnowledgeManifest } & PptKnowledgeManifest;
  if (data.data?.entries) return data.data;
  if (data.entries) return data as PptKnowledgeManifest;
  return EMPTY_MANIFEST;
}

export async function loadPptKnowledgeManifest(): Promise<PptKnowledgeManifest> {
  if (cachedManifest) return cachedManifest;
  try {
    const res = await fetch(KNOWLEDGE_BASE_URL);
    if (res.ok) {
      cachedManifest = parseApiPayload(await res.json());
      return cachedManifest;
    }
  } catch {
    /* 回退静态 manifest */
    try {
      const fallback = await fetch("/ppt-knowledge/manifest.json");
      if (fallback.ok) {
        cachedManifest = (await fallback.json()) as PptKnowledgeManifest;
        return cachedManifest;
      }
    } catch {
      /* ignore */
    }
  }
  return EMPTY_MANIFEST;
}

export function clearPptKnowledgeCache() {
  cachedManifest = null;
}

export function matchKnowledgeEntry(
  text: string,
  manifest: PptKnowledgeManifest,
): PptKnowledgeEntry | null {
  const hay = text.toLowerCase();
  let best: PptKnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of manifest.entries) {
    const score = entry.keywords.reduce((acc, kw) => {
      return hay.includes(kw.toLowerCase()) ? acc + 1 : acc;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}

/** 除主匹配外，收集其他相关条目的要点（用于知识库融合页） */
export function collectRelatedBullets(
  text: string,
  manifest: PptKnowledgeManifest,
  primaryId: string | undefined,
  limit = 6,
): string[] {
  const hay = text.toLowerCase();
  const bullets: string[] = [];

  for (const entry of manifest.entries) {
    if (entry.id === primaryId) continue;
    const hit = entry.keywords.some((kw) => hay.includes(kw.toLowerCase()));
    if (!hit && entry.id !== "bai-architecture-kb-report") continue;
    if (entry.theoryContent) {
      bullets.push(...theoryContentToBullets(entry.theoryContent).slice(0, 2));
    }
    if (bullets.length >= limit) break;
  }

  return bullets.slice(0, limit);
}

export function theoryContentToBullets(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^[-*#\s]+/, "").trim())
    .filter((line) => line.length > 4)
    .slice(0, 4);
}

export async function loadTheoryExcerpt(
  entry: PptKnowledgeEntry | null,
  theoryFile?: string | null,
): Promise<string[]> {
  if (entry?.theoryContent) {
    return theoryContentToBullets(entry.theoryContent);
  }
  if (!theoryFile) return [];
  try {
    const res = await fetch(`/ppt-knowledge/${theoryFile}`);
    if (!res.ok) return [];
    return theoryContentToBullets(await res.text());
  } catch {
    return [];
  }
}

export function resolveKnowledgeImage(
  entry: PptKnowledgeEntry | null,
): { imageUrl?: string; imageCaption?: string } {
  const img = entry?.images?.[0];
  if (!img) return {};
  const imageUrl = img.path.startsWith("/")
    ? img.path
    : `/ppt-knowledge/${img.path}`;
  return {
    imageUrl,
    imageCaption: img.caption,
  };
}
