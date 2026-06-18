import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { PanoramaView, PanoramaViewId } from "../../data/panoramaViews";
import { PanoramaTourViewport } from "./PanoramaTourViewport";

interface PanoramaFullscreenOverlayProps {
  activeViewId: PanoramaViewId;
  view: PanoramaView;
  onViewChange: (id: PanoramaViewId) => void;
  onClose: () => void;
}

export const PanoramaFullscreenOverlay: React.FC<
  PanoramaFullscreenOverlayProps
> = ({ activeViewId, view, onViewChange, onClose }) => {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.speechSynthesis?.cancel();
    };
  }, [onClose]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setPlaying(true);

    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(view.narration);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [view.id, view.narration]);

  const stopNarration = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  const resumeNarration = () => {
    if (!("speechSynthesis" in window)) {
      setPlaying(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(view.narration);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-black h-[100dvh] max-w-full overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${view.title} 全屏 3D 视角`}
    >
      <header className="shrink-0 px-3 sm:px-4 py-2.5 bg-black/90 border-b border-white/10 space-y-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-nupul-green truncate">
            {view.lessonTag}
          </p>
          <h3 className="text-sm font-bold !text-white truncate">
            {view.title}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            onClick={() => (playing ? stopNarration() : resumeNarration())}
            className="w-full text-xs font-bold py-2 px-2 sm:px-3 rounded-xl border-2 border-white/30 bg-white/15 !text-white hover:bg-white/25 cursor-pointer text-center"
          >
            {playing ? "停止解说" : "继续解说"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs font-bold py-2 px-2 sm:px-3 rounded-xl border-2 border-white/30 bg-white/10 !text-white hover:bg-white/20 cursor-pointer text-center"
          >
            退出展示
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 w-full">
        <PanoramaTourViewport
          className="h-full w-full rounded-none border-0"
          minHeight="min-h-0"
          immersive
          variant="stage"
          activeViewId={activeViewId}
          onViewChange={onViewChange}
        />
      </div>

      <footer className="shrink-0 px-3 sm:px-4 py-2.5 bg-black/90 border-t border-white/10 space-y-0.5">
        <p className="text-xs font-bold !text-white">
          {playing ? "正在播放本视角科普解说" : "解说已暂停"}
        </p>
        <p className="text-xs !text-white/75 leading-relaxed line-clamp-2">
          {view.narration}
        </p>
      </footer>
    </motion.div>,
    document.body,
  );
};
