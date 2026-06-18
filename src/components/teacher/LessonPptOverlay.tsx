import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Course } from "../../types";
import { CategoryTag } from "../ui/Tag";
import {
  buildBeautifiedSlidesFromAiPlanSync,
  buildBeautifiedSlidesFromCourse,
} from "../../lib/lessonPpt";
import type { AiGeneratedPlan, LessonSlide } from "../../lib/lessonPpt";

export type { LessonSlide, AiGeneratedPlan };

export function courseFromAiPlan(plan: AiGeneratedPlan): Course {
  return {
    id: `ai-plan-${Date.now()}`,
    title: plan.title,
    category: "motif",
    desc: plan.subtitle,
    duration: "15分钟精讲",
    difficulty: "进阶",
    isLocal: true,
    outline: plan.parts.map((p, i) => {
      const name = p.name.replace(/^\d+\.\s*/, "");
      return `第${i + 1}节：${name}`;
    }),
    materials: plan.suggestions,
  };
}

/** @deprecated 使用 buildBeautifiedSlidesFromAiPlan */
export function buildLessonSlidesFromAiPlan(plan: AiGeneratedPlan): LessonSlide[] {
  return buildBeautifiedSlidesFromAiPlanSync(plan);
}

/** @deprecated 使用 buildBeautifiedSlidesFromCourse */
export function buildLessonSlides(course: Course): LessonSlide[] {
  return buildBeautifiedSlidesFromCourse(course);
}

function isImmersiveSlide(slide: LessonSlide): boolean {
  return Boolean(
    slide.imageUrl &&
      (slide.layout === "cover" || slide.layout === "image-split"),
  );
}

function SlideContent({ slide }: { slide: LessonSlide }) {
  const layout = slide.layout ?? "section";

  if (layout === "cover") {
    if (slide.imageUrl) {
      return (
        <div className="lesson-ppt-immersive relative h-full w-full min-h-0 overflow-hidden">
          <img
            src={slide.imageUrl}
            alt={slide.imageCaption ?? slide.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="lesson-ppt-immersive-scrim absolute inset-0" aria-hidden />
          <div className="lesson-ppt-immersive-copy relative z-10 flex h-full flex-col justify-end p-4 sm:p-8">
            <h2 className="lesson-ppt-immersive-title text-display-lg sm:text-[30px] font-bold leading-snug">
              {slide.title}
            </h2>
            <p className="lesson-ppt-immersive-body sm:text-body font-semibold max-w-2xl mt-2">
              {slide.body}
            </p>
            {slide.imageCaption && (
              <p className="lesson-ppt-immersive-caption mt-2">
                {slide.imageCaption}
              </p>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="lesson-ppt-cover flex flex-col items-center justify-center text-center h-full gap-4">
        <div className="lesson-ppt-cover-accent w-full max-w-md h-1.5 rounded-full" />
        <h2 className="text-display-lg sm:text-[28px] font-bold text-nupul-dark leading-snug">
          {slide.title}
        </h2>
        <p className="text-secondary sm:text-body text-nupul-dark/80 font-semibold max-w-lg">
          {slide.body}
        </p>
      </div>
    );
  }

  if (layout === "image-split" && slide.imageUrl) {
    return (
      <div className="lesson-ppt-immersive relative h-full w-full min-h-0 overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.imageCaption ?? slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="lesson-ppt-immersive-scrim lesson-ppt-immersive-scrim--split absolute inset-0" aria-hidden />
        <div className="relative z-10 flex h-full min-h-0 items-end sm:items-center p-4 sm:p-8 overflow-y-auto">
          <div className="lesson-ppt-immersive-panel w-full max-w-xl sm:max-w-lg">
            <h2 className="lesson-ppt-immersive-title text-display-sm sm:text-display-md font-bold leading-snug">
              {slide.title}
            </h2>
            {slide.bullets?.length ? (
              <ul className="lesson-ppt-bullets lesson-ppt-bullets--light mt-3 space-y-2.5">
                {slide.bullets.map((b, i) => (
                  <li key={i} className="lesson-ppt-immersive-body font-semibold">
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lesson-ppt-immersive-body font-semibold whitespace-pre-line mt-3 leading-relaxed">
                {slide.body}
              </p>
            )}
            {slide.tip && (
              <p className="lesson-ppt-immersive-caption mt-4">
                <strong>授课贴士：</strong>
                {slide.tip}
              </p>
            )}
            {slide.imageCaption && (
              <p className="lesson-ppt-immersive-caption mt-3">
                {slide.imageCaption}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "closing") {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full gap-3">
        <h2 className="text-display-md font-bold text-nupul-green-dark">
          {slide.title}
        </h2>
        <p className="text-secondary text-nupul-dark/80 font-semibold max-w-md">
          {slide.body}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full min-h-0 gap-3">
      <h2 className="text-display-sm sm:text-display-md font-bold text-nupul-dark leading-snug">
        {slide.title}
      </h2>
      {slide.bullets?.length ? (
        <ul className="lesson-ppt-bullets space-y-2">
          {slide.bullets.map((b, i) => (
            <li key={i} className="text-secondary text-nupul-dark/85 font-semibold">
              {b}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-secondary sm:text-body text-nupul-dark/85 font-semibold leading-relaxed whitespace-pre-line">
          {slide.body}
        </p>
      )}
      {slide.tip && (
        <div className="lesson-ppt-tip">
          <strong>授课贴士：</strong>
          {slide.tip}
        </div>
      )}
    </div>
  );
}

interface LessonPptOverlayProps {
  course: Course;
  slides?: LessonSlide[];
  onClose: () => void;
}

const navBtnClass =
  "text-xs sm:text-caption font-bold py-2 px-3 sm:px-4 rounded-xl border-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";

export const LessonPptOverlay: React.FC<LessonPptOverlayProps> = ({
  course,
  slides: customSlides,
  onClose,
}) => {
  const slides = useMemo(
    () => customSlides ?? buildBeautifiedSlidesFromCourse(course),
    [customSlides, course],
  );
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const immersive = isImmersiveSlide(slide);
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [course.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goPrev, goNext]);

  return createPortal(
    <div
      className="lesson-ppt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${course.title} 上课课件`}
      data-ppt-skill="qingqiang-lesson-ppt"
    >
      <header className="lesson-ppt-header">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-nupul-green truncate">
            非遗美育微课课件
          </p>
          <h3 className="text-sm sm:text-base font-bold !text-white truncate">
            {course.title}
          </h3>
        </div>
        <span className="text-xs font-bold !text-white tabular-nums shrink-0 px-2">
          {index + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className={`${navBtnClass} border-white/35 bg-white/12 !text-white hover:bg-white/22 shrink-0`}
        >
          退出展示
        </button>
      </header>

      <main
        className={`lesson-ppt-stage${immersive ? " lesson-ppt-stage--immersive" : ""}`}
      >
        <article
          key={`${course.id}-${index}`}
          className={`lesson-ppt-slide${immersive ? " lesson-ppt-slide--immersive" : ""}`}
        >
          {!immersive && (
            <div className="shrink-0 flex items-center justify-between gap-3 pb-3 border-b-2 border-nupul-dark/10">
              <CategoryTag variant="brand">{slide.tag}</CategoryTag>
              {slide.footnote && (
                <span className="text-caption font-bold text-nupul-dark/55 shrink-0">
                  {slide.footnote}
                </span>
              )}
            </div>
          )}

          <div
            className={`lesson-ppt-slide-body${immersive ? " lesson-ppt-slide-body--immersive" : ""}`}
          >
            <SlideContent slide={slide} />
          </div>

          {!immersive && (
            <div className="shrink-0 pt-3 border-t-2 border-dashed border-nupul-dark/15 flex items-center justify-between gap-2">
              <span className="text-caption font-bold text-nupul-dark/45 truncate">
                青墙粉绘 · 大理白族民居彩绘美育
              </span>
              <span className="text-caption font-bold text-nupul-green-dark shrink-0">
                {course.difficulty}
              </span>
            </div>
          )}
        </article>
      </main>

      <footer className="lesson-ppt-footer">
        <button
          type="button"
          disabled={isFirst}
          onClick={goPrev}
          className={`${navBtnClass} border-white/35 bg-white/12 !text-white hover:bg-white/22`}
        >
          上一页
        </button>

        <div className="lesson-ppt-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`跳转到第 ${i + 1} 页`}
              aria-current={i === index ? "step" : undefined}
              className={`lesson-ppt-dot ${i === index ? "is-active" : ""}`}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={isLast}
          onClick={goNext}
          className={`${navBtnClass} border-nupul-dark bg-nupul-green !text-white hover:bg-nupul-green-dark`}
        >
          下一页
        </button>
      </footer>
    </div>,
    document.body,
  );
};
