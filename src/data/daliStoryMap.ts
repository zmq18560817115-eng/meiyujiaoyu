import manifest from "../../data/story-map/dali-stories.json";
import type {
  DaliStoryLesson,
  DaliStoryMapManifest,
} from "../lib/lessonPpt/storyLessonTypes";

export const DALI_STORY_MAP = manifest as DaliStoryMapManifest;

export const DALI_STORY_LESSONS = DALI_STORY_MAP.stories;

export function getStoryLesson(id: string): DaliStoryLesson | undefined {
  return DALI_STORY_LESSONS.find((s) => s.id === id);
}

export function getStoryLessonByIndex(index: number): DaliStoryLesson | undefined {
  return DALI_STORY_LESSONS[index];
}

export function getExampleStoryLesson(): DaliStoryLesson {
  return (
    getStoryLesson(DALI_STORY_MAP.exampleLessonStoryId) ?? DALI_STORY_LESSONS[2]
  );
}
