import {
  collectRelatedBullets,
  loadPptKnowledgeManifest,
  matchKnowledgeEntry,
} from "../lessonPpt/knowledgeBase";

/** 对话用知识摘录：≤3 条，每条约 40 字 */
export async function matchKnowledgeForChat(
  query: string,
): Promise<{ entryTitle?: string; bullets: string[] }> {
  const manifest = await loadPptKnowledgeManifest();
  const entry = matchKnowledgeEntry(query, manifest);
  if (!entry) return { bullets: [] };

  const related = collectRelatedBullets(query, manifest, entry.id);
  const fromTheory = entry.theoryContent
    .split(/\n/)
    .map((l) => l.replace(/^[-*#\d.]+\s*/, "").trim())
    .filter((l) => l.length > 8 && l.length < 80)
    .slice(0, 2);

  const bullets = [...new Set([...fromTheory, ...related])].slice(0, 3);
  return { entryTitle: entry.title, bullets };
}
