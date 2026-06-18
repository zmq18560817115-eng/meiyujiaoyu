import type { Course } from "../../types";
import { LESSON_PPT_DESIGN } from "./manifest";
import {
  collectRelatedBullets,
  loadPptKnowledgeManifest,
  loadTheoryExcerpt,
  matchKnowledgeEntry,
  resolveKnowledgeImage,
} from "./knowledgeBase";
import type { AiGeneratedPlan, LessonSlide } from "./types";

function splitDescToBullets(desc: string): string[] {
  const parts = desc
    .split(/[。；\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.slice(0, LESSON_PPT_DESIGN.limits.maxBullets) : [desc];
}

function stripSectionPrefix(name: string) {
  return name.replace(/^\d+\.\s*/, "");
}

export async function buildBeautifiedSlidesFromAiPlan(
  plan: AiGeneratedPlan,
): Promise<LessonSlide[]> {
  const manifest = await loadPptKnowledgeManifest();
  const knowledge = matchKnowledgeEntry(
    `${plan.title} ${plan.subtitle}`,
    manifest,
  );
  const theoryBullets = await loadTheoryExcerpt(
    knowledge,
    knowledge?.theoryFile,
  );
  const { imageUrl, imageCaption } = resolveKnowledgeImage(knowledge);

  const slides: LessonSlide[] = [
    {
      layout: "cover",
      tag: "课件封面",
      title: plan.title,
      body: plan.subtitle,
      footnote: "进阶 · 15分钟精讲",
    },
  ];

  plan.parts.forEach((p, i) => {
    const title = stripSectionPrefix(p.name);
    const useImage = i === 0 && imageUrl;
    slides.push({
      layout: useImage ? "image-split" : "section",
      tag: `第${i + 1}环节`,
      title,
      body: p.desc,
      bullets: splitDescToBullets(p.desc),
      tip: p.tip,
      imageUrl: useImage ? imageUrl : undefined,
      imageCaption: useImage ? imageCaption : undefined,
    });
  });

  const relatedBullets = collectRelatedBullets(
    `${plan.title} ${plan.subtitle}`,
    manifest,
    knowledge?.id,
  );
  const kbBullets = [...new Set([...theoryBullets, ...relatedBullets])].slice(
    0,
    6,
  );

  if (kbBullets.length > 0) {
    slides.push({
      layout: "content",
      tag: "非遗知识",
      title: knowledge?.title ?? "知识库要点",
      body: "",
      bullets: kbBullets,
    });
  }

  if (plan.suggestions?.length) {
    slides.push({
      layout: "content",
      tag: "拓展研学",
      title: "拓展研学建议",
      body: "",
      bullets: plan.suggestions.map((s) => s.replace(/^[·\s]+/, "")),
    });
  }

  slides.push({
    layout: "closing",
    tag: "课堂结语",
    title: LESSON_PPT_DESIGN.closing.title,
    body: LESSON_PPT_DESIGN.closing.body,
  });

  return slides;
}

export function buildBeautifiedSlidesFromCourse(course: Course): LessonSlide[] {
  const slides: LessonSlide[] = [
    {
      layout: "cover",
      tag: "课件封面",
      title: course.title,
      body: course.desc,
      footnote: `${course.difficulty} · ${course.duration}`,
    },
  ];

  course.outline.forEach((line, i) => {
    const matched = line.match(/^第(.+?)节[：:](.+)$/);
    const sectionTitle = matched ? matched[2].trim() : line;
    const body = matched
      ? `本环节围绕「${sectionTitle}」开展情境导入、观察讨论与动手实践。`
      : `引导学生完成本环节学习任务，巩固${course.title}的理解与表达。`;
    slides.push({
      layout: "section",
      tag: matched ? `第${matched[1]}节` : `环节 ${i + 1}`,
      title: sectionTitle,
      body,
      bullets: splitDescToBullets(body),
    });
  });

  if (course.materials?.length) {
    slides.push({
      layout: "content",
      tag: "配套媒资",
      title: "课堂配套资源",
      body: "",
      bullets: course.materials.map((m) => m.replace(/^[·\s]+/, "")),
    });
  }

  slides.push({
    layout: "closing",
    tag: "课堂结语",
    title: LESSON_PPT_DESIGN.closing.title,
    body: LESSON_PPT_DESIGN.closing.body,
  });

  return slides;
}

/** 同步回退：无知识库 fetch 时使用 */
export function buildBeautifiedSlidesFromAiPlanSync(
  plan: AiGeneratedPlan,
): LessonSlide[] {
  const slides: LessonSlide[] = [
    {
      layout: "cover",
      tag: "课件封面",
      title: plan.title,
      body: plan.subtitle,
      footnote: "进阶 · 15分钟精讲",
    },
  ];

  plan.parts.forEach((p, i) => {
    const title = stripSectionPrefix(p.name);
    slides.push({
      layout: "section",
      tag: `第${i + 1}环节`,
      title,
      body: p.desc,
      bullets: splitDescToBullets(p.desc),
      tip: p.tip,
    });
  });

  if (plan.suggestions?.length) {
    slides.push({
      layout: "content",
      tag: "拓展研学",
      title: "拓展研学建议",
      body: "",
      bullets: plan.suggestions.map((s) => s.replace(/^[·\s]+/, "")),
    });
  }

  slides.push({
    layout: "closing",
    tag: "课堂结语",
    title: LESSON_PPT_DESIGN.closing.title,
    body: LESSON_PPT_DESIGN.closing.body,
  });

  return slides;
}
