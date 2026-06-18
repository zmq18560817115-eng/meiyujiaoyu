import type { Course } from "../../types";
import {
  DALI_STORY_MAP,
  getStoryLesson,
} from "../../data/daliStoryMap";
import type {
  DaliStoryLesson,
  StoryLessonFlowStep,
  StoryLessonImage,
} from "./storyLessonTypes";
import { LESSON_PPT_DESIGN } from "./manifest";
import {
  collectRelatedBullets,
  loadPptKnowledgeManifest,
  loadTheoryExcerpt,
  matchKnowledgeEntry,
  resolveKnowledgeImage,
} from "./knowledgeBase";
import type { LessonSlide } from "./types";

function objectiveBullets(story: DaliStoryLesson): string[] {
  const obj = story.extendedLesson?.objectives ?? DALI_STORY_MAP.defaultObjectives;
  return [
    ...obj.knowledge.map((t) => `知识：${t}`),
    ...obj.ability.map((t) => `能力：${t}`),
    ...obj.emotion.map((t) => `情感：${t}`),
    ...obj.creative.map((t) => `创作：${t}`),
  ];
}

function defaultFlow(story: DaliStoryLesson): StoryLessonFlowStep[] {
  return [
    {
      name: "故事导入，进入照壁场景",
      teacherScript: story.storyEntry,
      aiScript: story.storyBody.split("。")[0] + "。",
    },
    {
      name: "AI 讲故事，教师适时暂停",
      aiScript: story.storyBody,
      questions: story.aiQuestions,
    },
    {
      name: "文化解码，读懂照壁寓意",
      aiScript: story.culturalDecode,
    },
    {
      name: "学生创作任务",
      aiScript: story.drawingTask,
      teacherFocus: `作品讲述句式：${story.workNarrative}`,
    },
  ];
}

function flowSteps(story: DaliStoryLesson): StoryLessonFlowStep[] {
  if (story.extendedLesson?.flow?.length) {
    return story.extendedLesson.flow;
  }
  return defaultFlow(story);
}

function resolveStoryImageUrl(path: string): string {
  return path.startsWith("/") ? path : `/ppt-knowledge/${path}`;
}

function storyImageAt(
  images: StoryLessonImage[] | undefined,
  index: number,
): { imageUrl?: string; imageCaption?: string } {
  const img = images?.[index];
  if (!img) return {};
  return {
    imageUrl: resolveStoryImageUrl(img.path),
    imageCaption: img.caption,
  };
}

function isCreationFlowStep(
  step: StoryLessonFlowStep,
  story: DaliStoryLesson,
): boolean {
  return (
    step.name.includes("创作") ||
    step.name.includes("绘画") ||
    step.aiScript === story.drawingTask
  );
}

/** 封面占首张；末张留给创作环节；中间环节顺序使用其余配图 */
function resolveFlowStepImage(
  images: StoryLessonImage[] | undefined,
  step: StoryLessonFlowStep,
  stepIndex: number,
  story: DaliStoryLesson,
  coverUsesFirst: boolean,
): { imageUrl?: string; imageCaption?: string } {
  if (!images?.length) return {};

  if (isCreationFlowStep(step, story) && images.length > 1) {
    return storyImageAt(images, images.length - 1);
  }

  const poolStart = coverUsesFirst ? 1 : 0;
  const poolEnd = images.length > 1 ? images.length - 1 : images.length;
  const pool = images.slice(poolStart, poolEnd);
  return storyImageAt(pool, stepIndex);
}

function stepBody(step: StoryLessonFlowStep): string {
  const parts = [step.aiScript, step.teacherScript, step.teacherFocus].filter(
    Boolean,
  );
  return parts.join("\n\n");
}

export function courseFromStoryLesson(story: DaliStoryLesson): Course {
  const duration = story.extendedLesson?.duration ?? "40 分钟";
  const grade = story.extendedLesson?.grade ?? `适用 ${story.ageRange}`;
  return {
    id: story.id,
    title: `《${story.title}》`,
    category: "base",
    desc: story.positioning,
    duration,
    difficulty: "进阶",
    isLocal: true,
    outline: flowSteps(story).map((s, i) => `第${i + 1}节：${s.name}`),
    materials: story.workTags.map((t) => `#${t}`),
    bannerUrl: story.lessonImages?.[0]
      ? resolveStoryImageUrl(story.lessonImages[0].path)
      : undefined,
  };
}

export async function buildBeautifiedSlidesFromStoryLesson(
  storyId: string,
): Promise<LessonSlide[]> {
  const story = getStoryLesson(storyId);
  if (!story) {
    throw new Error(`未找到照壁故事：${storyId}`);
  }

  const manifest = await loadPptKnowledgeManifest();
  const knowledge = matchKnowledgeEntry(
    `${story.title} ${story.culturalDecode}`,
    manifest,
  );
  const theoryBullets = await loadTheoryExcerpt(
    knowledge,
    knowledge?.theoryFile,
  );
  const { imageUrl: kbImageUrl, imageCaption: kbImageCaption } =
    resolveKnowledgeImage(knowledge);
  const storyImages = story.lessonImages;
  const coverImage = storyImageAt(storyImages, 0);

  const subtitle =
    story.extendedLesson?.courseType ??
    `照壁故事课 · 适用 ${story.ageRange}`;

  const slides: LessonSlide[] = [
    {
      layout: "cover",
      tag: "课件封面",
      title: `《${story.title}》`,
      body: subtitle,
      footnote: story.extendedLesson?.duration ?? "40 分钟课堂",
      imageUrl: coverImage.imageUrl,
      imageCaption: coverImage.imageCaption,
    },
    {
      layout: "section",
      tag: "课程定位",
      title: "故事定位",
      body: story.positioning,
      tip: story.storyEntry,
    },
    {
      layout: "content",
      tag: "教学目标",
      title: "教学目标",
      body: "",
      bullets: objectiveBullets(story),
    },
  ];

  const steps = flowSteps(story);
  const coverUsesFirst = Boolean(coverImage.imageUrl);
  steps.forEach((step, i) => {
    const storyImg = resolveFlowStepImage(
      storyImages,
      step,
      i,
      story,
      coverUsesFirst,
    );
    const fallbackKb =
      i === 0 && !storyImg.imageUrl
        ? { imageUrl: kbImageUrl, imageCaption: kbImageCaption }
        : {};
    const slideImage = storyImg.imageUrl
      ? storyImg
      : fallbackKb.imageUrl
        ? fallbackKb
        : {};
    const useImage = Boolean(slideImage.imageUrl);
    const bullets = [
      ...(step.questions ?? []),
      ...(step.teacherScript && !step.aiScript ? [step.teacherScript] : []),
    ].filter(Boolean);

    slides.push({
      layout: useImage ? "image-split" : "section",
      tag: `第${i + 1}环节`,
      title: step.name,
      body: stepBody(step),
      bullets: bullets.length > 0 ? bullets.slice(0, 4) : undefined,
      tip: step.teacherFocus,
      imageUrl: slideImage.imageUrl,
      imageCaption: slideImage.imageCaption,
    });
  });

  const drawingSlideImage =
    storyImages && storyImages.length > 1
      ? storyImageAt(storyImages, storyImages.length - 1)
      : {};
  const hasFlowCreationStep = steps.some((s) => isCreationFlowStep(s, story));
  slides.push({
    layout: drawingSlideImage.imageUrl && !hasFlowCreationStep
      ? "image-split"
      : "section",
    tag: "绘画任务",
    title: "学生绘画任务",
    body: story.drawingTask,
    tip: `讲述句式：${story.workNarrative}`,
    bullets: story.workTags.map((t) => `#${t}`),
    imageUrl: hasFlowCreationStep ? undefined : drawingSlideImage.imageUrl,
    imageCaption: hasFlowCreationStep
      ? undefined
      : drawingSlideImage.imageCaption,
  });

  const kbBullets = collectRelatedBullets(
    `${story.title} ${story.culturalDecode}`,
    manifest,
    knowledge?.id,
  );
  const mergedKb = [...new Set([...theoryBullets, ...kbBullets])].slice(0, 5);
  if (mergedKb.length > 0) {
    slides.push({
      layout: "content",
      tag: "非遗知识",
      title: knowledge?.title ?? "文化解码补充",
      body: story.culturalDecode,
      bullets: mergedKb,
    });
  }

  slides.push({
    layout: "content",
    tag: "评价标准",
    title: "AI 辅助作品点评标准",
    body: "学生上传作品后，AI 从以下维度辅助教师点评：",
    bullets: DALI_STORY_MAP.reviewCriteria.map(
      (c) => `${c.dimension}：${c.description}`,
    ),
  });

  slides.push({
    layout: "closing",
    tag: "课堂结语",
    title: "照壁不只是一面墙",
    body:
      story.id === DALI_STORY_MAP.exampleLessonStoryId
        ? "教师端直接生成一堂可讲、可问、可画、可评的照壁故事课。让学生理解：照壁是一封写给家人的无声家书。"
        : LESSON_PPT_DESIGN.closing.body,
  });

  return slides;
}
