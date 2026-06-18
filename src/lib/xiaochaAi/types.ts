export type XiaochaRole = "teacher" | "student";

export type LessonTopicSources = {
  lessonPresentCourseTitle?: string | null;
  aiGeneratedPlanTitle?: string | null;
  lessonTopic?: string | null;
};

export type ChatContext = {
  message: string;
  history: Array<{ sender: string; text: string }>;
  role: XiaochaRole;
  lessonTopic?: string;
  knowledgeExcerpt?: string[];
};

export type ChatReply = {
  text: string;
  source: string;
};

export type MotifId =
  | "courtyard-screen"
  | "butterfly-motif"
  | "color-bands"
  | "brush-stroke"
  | "ethics-screen"
  | "default-screen";
