/** 照壁故事课 · 统一课件模板（教学目标→评价标准，不直接展示为 UI 标签） */

export interface StoryReviewCriterion {
  dimension: string;
  description: string;
}

export interface StoryLessonImage {
  path: string;
  caption: string;
}

export interface StoryLessonFlowStep {
  name: string;
  teacherScript?: string;
  aiScript?: string;
  questions?: string[];
  teacherFocus?: string;
}

export interface StoryLessonObjectives {
  knowledge: string[];
  ability: string[];
  emotion: string[];
  creative: string[];
}

export interface StoryExtendedLesson {
  courseType: string;
  grade: string;
  duration: string;
  scene?: string;
  teacherRole?: string;
  aiRole?: string;
  objectives: StoryLessonObjectives;
  flow: StoryLessonFlowStep[];
}

export interface DaliStoryLesson {
  id: string;
  storyNo: number;
  title: string;
  positioning: string;
  ageRange: string;
  storyEntry: string;
  storyBody: string;
  culturalDecode: string;
  aiQuestions: string[];
  drawingTask: string;
  workNarrative: string;
  workTags: string[];
  /** 故事课配图，用于 PPT image-split 版式 */
  lessonImages?: StoryLessonImage[];
  extendedLesson?: StoryExtendedLesson;
}

export interface DaliStoryMapManifest {
  version: number;
  title: string;
  subtitle: string;
  sourcePdf: string;
  exampleLessonPdf: string;
  exampleLessonStoryId: string;
  reviewCriteria: StoryReviewCriterion[];
  defaultObjectives: StoryLessonObjectives;
  /** 生成课件时的统一章节顺序（内部模板，不在界面展示） */
  templateSections: string[];
  stories: DaliStoryLesson[];
}
