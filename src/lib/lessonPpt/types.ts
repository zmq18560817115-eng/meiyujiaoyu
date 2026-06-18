export type LessonSlideLayout =
  | "cover"
  | "section"
  | "image-split"
  | "content"
  | "closing";

export interface LessonSlide {
  tag: string;
  title: string;
  body: string;
  footnote?: string;
  layout?: LessonSlideLayout;
  bullets?: string[];
  tip?: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface AiGeneratedPlan {
  title: string;
  subtitle: string;
  parts: { name: string; desc: string; tip: string }[];
  suggestions: string[];
}

export interface PptKnowledgeImage {
  path: string;
  caption: string;
  assetId?: string;
}

export interface PptKnowledgeEntry {
  id: string;
  title?: string;
  keywords: string[];
  theoryFile?: string | null;
  theoryContent?: string;
  images: PptKnowledgeImage[];
}

export interface PptKnowledgeManifest {
  version: number;
  entries: PptKnowledgeEntry[];
}
