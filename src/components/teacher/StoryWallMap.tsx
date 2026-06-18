import React, { useState } from "react";
import type { DaliStoryLesson } from "../../lib/lessonPpt/storyLessonTypes";
import { DALI_STORY_MAP } from "../../data/daliStoryMap";

const WALL_BG = "/story-map/zhaobi-story-wall.png?v=2";

/** 仅故事 3 标题过长，分两列竖排（右列在前） */
function wallTitleLines(title: string): string[] {
  if (title === "百忍家声的一百个忍字") {
    return ["百忍家声的", "一百个忍字"];
  }
  return [title];
}

interface StoryWallMapProps {
  stories: DaliStoryLesson[];
  loadingStoryId: string | null;
  onGenerate: (storyId: string) => void;
}

export const StoryWallMap: React.FC<StoryWallMapProps> = ({
  stories,
  loadingStoryId,
  onGenerate,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    stories[0]?.id ?? null,
  );
  const selected = stories.find((s) => s.id === selectedId);
  const exampleId = DALI_STORY_MAP.exampleLessonStoryId;

  const handleTileClick = (storyId: string) => {
    setSelectedId(storyId);
    if (loadingStoryId) return;
    onGenerate(storyId);
  };

  return (
    <div id="story-map-route" className="space-y-3">
      <div>
        <p className="text-caption font-bold text-nupul-dark">照壁故事地图</p>
        <p className="text-[11px] md:text-caption text-nupul-dark/60 font-semibold mt-0.5">
          点击照壁题字窗口，直接进入照壁故事课课件展示
        </p>
      </div>

      <div className="story-wall-map relative w-full max-w-3xl mx-auto select-none">
        <img
          src={WALL_BG}
          alt="照壁故事地图"
          className="w-full h-auto block pointer-events-none"
          draggable={false}
        />
        <div
          className="story-wall-map-grid absolute"
          style={{
            left: "20.5%",
            top: "30%",
            width: "59%",
            height: "46%",
          }}
        >
          {stories.map((story) => {
            const isSelected = selectedId === story.id;
            const isLoading = loadingStoryId === story.id;
            const lines = wallTitleLines(story.title);
            const textDensity =
              lines.length > 1 || story.title.length >= 9
                ? "compact"
                : story.title.length >= 8
                  ? "medium"
                  : "normal";
            return (
              <button
                key={story.id}
                type="button"
                title={`${story.title} · 点击进入课件`}
                disabled={
                  loadingStoryId !== null && loadingStoryId !== story.id
                }
                onClick={() => handleTileClick(story.id)}
                className={`story-wall-tile group ${
                  isSelected
                    ? "story-wall-tile--selected ring-2 ring-nupul-green-dark bg-nupul-yellow shadow-sm"
                    : "bg-white hover:bg-nupul-cream"
                } ${isLoading ? "animate-pulse" : ""}`}
              >
                <span
                  className="story-wall-tile-no absolute top-1 left-1 z-10"
                  aria-hidden
                >
                  {story.storyNo}
                </span>
                {story.id === exampleId && (
                  <span
                    className="absolute top-1 right-1 z-10 h-1.5 w-1.5 rounded-full bg-sky-500 border border-white pointer-events-none"
                    title="教师端示例课"
                  />
                )}
                <span className="story-wall-tile-body">
                  {lines.map((line) => (
                    <span
                      key={line}
                      className={`story-wall-tile-text story-wall-tile-text--${textDensity}`}
                    >
                      {line}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="max-w-3xl mx-auto bg-nupul-cream rounded-2xl border-3 border-nupul-dark p-3 sm:p-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption font-mono font-bold text-nupul-orange bg-nupul-yellow/30 border border-nupul-dark/20 px-2 py-0.5 rounded">
              故事 {String(selected.storyNo).padStart(2, "0")}
            </span>
            <span className="text-caption text-nupul-dark/55 font-bold">
              适用 {selected.ageRange}
            </span>
            {selected.id === exampleId && (
              <span className="text-[10px] sm:text-caption bg-sky-100 text-nupul-dark py-0.5 px-2 rounded-full border border-sky-400/50 font-bold">
                教师端示例课
              </span>
            )}
          </div>
          <h5 className="text-secondary font-bold text-nupul-dark">
            {selected.title}
          </h5>
          <p className="text-caption text-nupul-dark/80 leading-relaxed font-medium line-clamp-2">
            {selected.positioning}
          </p>
          <p className="text-caption text-nupul-green-dark/90 font-semibold leading-snug line-clamp-2">
            故事入口：{selected.storyEntry}
          </p>
          <button
            type="button"
            disabled={loadingStoryId === selected.id}
            onClick={() => onGenerate(selected.id)}
            className="nupul-pill-btn-green py-2 px-3 text-caption font-bold cursor-pointer disabled:opacity-50"
          >
            {loadingStoryId === selected.id
              ? "课件生成中…"
              : "一键生成照壁故事课"}
          </button>
        </div>
      )}
    </div>
  );
};
