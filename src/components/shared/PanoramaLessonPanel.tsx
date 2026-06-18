import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PanoramaView } from "../../data/panoramaViews";
import { renderDiffuseAccents } from "../ui/DiffuseDecor";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

interface PanoramaLessonPanelProps {
  view: PanoramaView;
  variant?: "teacher" | "student";
  className?: string;
  /** 教师端：点击播放时进入全屏 3D 视角 */
  onFullscreenPlay?: () => void;
  isFullscreen?: boolean;
  onFullscreenExit?: () => void;
}

export const PanoramaLessonPanel: React.FC<PanoramaLessonPanelProps> = ({
  view,
  variant = "teacher",
  className,
  onFullscreenPlay,
  isFullscreen = false,
  onFullscreenExit,
}) => {
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isTeacher = variant === "teacher";

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    utteranceRef.current = null;
  }, [view.id]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const stopNarration = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    utteranceRef.current = null;
  };

  useEffect(() => {
    if (isFullscreen) {
      setPlaying(true);
      return;
    }
    if (playing) stopNarration();
  }, [isFullscreen]);

  const playNarration = () => {
    if (isFullscreen) {
      onFullscreenExit?.();
      stopNarration();
      return;
    }

    if (onFullscreenPlay) {
      onFullscreenPlay();
      return;
    }

    if (playing) {
      stopNarration();
      return;
    }

    if (!("speechSynthesis" in window)) {
      setPlaying(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(view.narration);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    utteranceRef.current = utterance;
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isTeacher) {
    return (
      <div
        className={cn(
          "relative bg-white p-5 rounded-3xl border-3 border-nupul-dark flex flex-col justify-between space-y-4 overflow-hidden",
          className,
        )}
      >
        {renderDiffuseAccents([
          { corner: "tr", color: "yellow", inset: true, soft: true, size: "sm" },
          { corner: "bl", color: "green", inset: true, soft: true, size: "sm" },
        ])}
        <div className="relative z-10 space-y-3 flex flex-col justify-between flex-1">
        <div className="space-y-3">
          <span className="text-caption font-bold text-nupul-green-dark bg-nupul-green/15 border border-nupul-green-dark/20 px-2 py-0.5 rounded-full inline-block">
            {view.lessonTag}
          </span>

          <h5 className="text-body font-bold text-nupul-dark">{view.title}</h5>

          <p className="text-caption text-nupul-dark/80 leading-relaxed font-semibold">
            {view.desc}
          </p>

          <div className="bg-nupul-cream p-3 rounded-2xl border-2 border-stone-800/15 space-y-1 text-caption text-nupul-dark/75">
            <strong className="block text-nupul-green-dark font-bold">
              随堂多感官教学法：
            </strong>
            <p>{view.teachingTip}</p>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t-2 border-dashed border-nupul-dark/10">
          <button
            type="button"
            onClick={playNarration}
            className={cn(
              "w-full text-caption font-bold py-2.5 px-4 rounded-xl border-2 transition active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer",
              playing
                ? "bg-nupul-green-dark text-white border-white"
                : "bg-nupul-yellow text-nupul-dark border-nupul-dark",
            )}
          >
            <span>
              {playing || isFullscreen
                ? "正在全屏播放科普解说…"
                : "播放本视角科普解说"}
            </span>
          </button>

          <AnimatePresence mode="wait">
            {playing && (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-nupul-soft-green text-nupul-green-dark border border-nupul-green-dark/20 p-3 rounded-2xl text-caption font-medium leading-relaxed overflow-hidden"
              >
                <strong className="block opacity-85 mb-1">
                  {view.navLabel} · 课程科普解说：
                </strong>
                “{view.narration}”
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between space-y-3 bg-nupul-cream p-4 md:p-4 rounded-2xl border-3 border-nupul-dark overflow-hidden",
        className,
      )}
    >
      {renderDiffuseAccents([
        { corner: "tr", color: "green", inset: true, soft: true, size: "sm" },
        { dot: true, color: "yellow", soft: true, className: "bottom-10 -left-2" },
      ])}
      <div className="relative z-10 flex flex-col justify-between space-y-3 flex-1 min-h-0">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-caption font-bold bg-nupul-green text-nupul-dark px-3 py-1 rounded-full border-2 border-nupul-dark">
            {view.lessonTag}
          </span>
          <span className="text-caption font-mono tracking-widest text-[#1a365d] font-extrabold uppercase">
            {view.bilingual}
          </span>
        </div>

        <h4 className="text-body font-bold text-nupul-dark border-b-2 border-nupul-dark/10 pb-2">
          {view.title}
        </h4>

        <p className="text-caption text-nupul-dark/90 leading-relaxed font-medium">
          {view.desc}
        </p>
      </div>

      <div className="bg-white p-3 rounded-xl border-3 border-nupul-dark space-y-2">
        <div className="text-nupul-dark font-bold text-caption">
          小草的非遗伴读
        </div>
        <p className="text-caption text-nupul-dark/70 leading-relaxed italic font-medium">
          “{view.studentNarration}”
        </p>
        <button
          type="button"
          onClick={playNarration}
          className={cn(
            "flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-caption font-bold border-3 border-nupul-dark active:translate-y-0.5 transition-all cursor-pointer",
            playing
              ? "bg-nupul-orange text-white"
              : "bg-nupul-yellow text-nupul-dark hover:bg-nupul-yellow",
          )}
        >
          {playing ? "停止伴读" : "播放本视角科普解说"}
        </button>
      </div>
      </div>
    </div>
  );
};
