import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const SPLASH_MS = 3400;

const SPARKLES = [
  { x: "12%", y: "18%", delay: 0, size: 10 },
  { x: "78%", y: "14%", delay: 0.35, size: 8 },
  { x: "88%", y: "42%", delay: 0.7, size: 12 },
  { x: "6%", y: "55%", delay: 0.5, size: 9 },
  { x: "22%", y: "72%", delay: 0.9, size: 11 },
  { x: "68%", y: "68%", delay: 1.1, size: 8 },
  { x: "45%", y: "8%", delay: 0.2, size: 7 },
  { x: "92%", y: "78%", delay: 1.3, size: 10 },
] as const;

interface HomeSplashIntroProps {
  onComplete: () => void;
}

export const HomeSplashIntro: React.FC<HomeSplashIntroProps> = ({
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(false);

  const dismiss = () => {
    if (doneRef.current) return;
    setVisible(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(dismiss, SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleExitComplete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="home-splash"
          className="home-splash-screen fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-live="polite"
          role="dialog"
          aria-label="大理白族彩绘美育系统欢迎画面"
        >
          <div className="home-splash-bg absolute inset-0" aria-hidden />

          {SPARKLES.map((s, i) => (
            <motion.span
              key={i}
              className="home-splash-sparkle pointer-events-none absolute rounded-full border-2 border-nupul-dark bg-nupul-yellow"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.85, 1],
                scale: [0, 1, 0.9, 1],
                y: [0, -10, 0, -6],
                rotate: [0, 12, -8, 0],
              }}
              transition={{
                duration: 2.8,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden
            />
          ))}

          <motion.div
            className="relative z-10 w-full max-w-3xl px-5 sm:px-8"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.12,
            }}
          >
            <motion.div
              className="home-splash-hero-wrap relative rounded-[28px] border-3 border-nupul-dark overflow-hidden bg-[#ffc526] shadow-[0_10px_0_#3b2e0b]"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.img
                src="/home-splash-hero.png"
                alt="大理白族彩绘美育系统 — 传承民族文化，开启美育之旅"
                className="w-full h-auto block"
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
                draggable={false}
              />
              <motion.div
                className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#ffc526]/25 via-transparent to-white/10"
                animate={{ opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                aria-hidden
              />
            </motion.div>
          </motion.div>

          <motion.p
            className="relative z-10 mt-6 text-caption font-bold text-nupul-dark/70 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            传承民族文化 · 开启美育之旅
          </motion.p>

          <div className="relative z-10 mt-5 w-full max-w-xs px-8">
            <div className="h-2 rounded-full border-2 border-nupul-dark bg-white/80 overflow-hidden">
              <motion.div
                className="h-full bg-nupul-green rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: SPLASH_MS / 1000,
                  ease: "linear",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="absolute top-5 right-5 z-20 text-caption font-bold text-nupul-dark/55 hover:text-nupul-dark bg-white/70 hover:bg-white border-2 border-nupul-dark/20 hover:border-nupul-dark px-3 py-1.5 rounded-full cursor-pointer transition"
          >
            跳过
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const HOME_SPLASH_SESSION_KEY = "nupul-home-splash-seen";

export function shouldShowHomeSplash(): boolean {
  if (typeof sessionStorage === "undefined") return true;
  return !sessionStorage.getItem(HOME_SPLASH_SESSION_KEY);
}

export function markHomeSplashSeen(): void {
  try {
    sessionStorage.setItem(HOME_SPLASH_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}
