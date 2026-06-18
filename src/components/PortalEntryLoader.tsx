/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { IpMascotRunnerFigure } from "./shared/IpMascotRunnerFigure";
import { NupulIcon } from "./icons";

type PortalRole = "teacher" | "student";

const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
const EASE_RUN = [0.37, 0, 0.16, 1] as const;
const MILESTONES = [25, 50, 75] as const;

interface PortalEntryLoaderProps {
  role: PortalRole;
  displayName: string;
  tagline?: string;
  durationMs?: number;
  exiting?: boolean;
  onExitComplete?: () => void;
}

const ROLE_COPY: Record<
  PortalRole,
  { headline: string; lines: string[] }
> = {
  teacher: {
    headline: "美育工作台",
    lines: [
      "正在同步课程与馆藏…",
      "整理学生作品与通知…",
      "双廊非遗数字舱启动中…",
    ],
  },
  student: {
    headline: "研学舱",
    lines: [
      "正在加载白族纹样与全景…",
      "准备智能设色与对话素材…",
      "欢迎进入数智美育空间…",
    ],
  },
};

const FLOAT_DECOR = [
  { icon: "cloud" as const, x: "12%", y: "18%", delay: 0 },
  { icon: "pattern" as const, x: "82%", y: "22%", delay: 0.4 },
  { icon: "palette" as const, x: "8%", y: "72%", delay: 0.8 },
  { icon: "cube" as const, x: "88%", y: "68%", delay: 1.1 },
];

export const PortalEntryLoader: React.FC<PortalEntryLoaderProps> = ({
  role,
  displayName,
  tagline,
  durationMs = 2800,
  exiting = false,
  onExitComplete,
}) => {
  const copy = ROLE_COPY[role];
  const runSec = durationMs / 1000;
  const [lineIndex, setLineIndex] = useState(0);
  const [displayPct, setDisplayPct] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [hitMilestones, setHitMilestones] = useState<Set<number>>(
    () => new Set(),
  );
  const startRef = useRef(performance.now());

  useEffect(() => {
    startRef.current = performance.now();
    setCelebrate(false);
    setHitMilestones(new Set());
    setDisplayPct(0);

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const ratio = Math.min(1, elapsed / durationMs);
      const pct = Math.round(ratio * 100);
      setDisplayPct(pct);
      setHitMilestones((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const m of MILESTONES) {
          if (pct >= m && !next.has(m)) {
            next.add(m);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      if (ratio >= 1) {
        setCelebrate(true);
        window.clearInterval(timer);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [durationMs, displayName, role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % copy.lines.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [copy.lines.length]);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => onExitComplete?.(), 620);
    return () => window.clearTimeout(timer);
  }, [exiting, onExitComplete]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[300] min-h-screen flex flex-col items-center justify-center ip-entry-loader-screen overflow-hidden select-none"
      style={{ backgroundColor: "#fff9ee" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{
        duration: exiting ? 0.62 : 0.48,
        ease: EASE_SMOOTH,
      }}
      aria-live="polite"
      aria-busy={!exiting}
      role="status"
    >
      {FLOAT_DECOR.map((d, i) => (
        <motion.div
          key={d.icon}
          className="ip-entry-float-decor pointer-events-none"
          style={{ left: d.x, top: d.y }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: exiting ? 0 : 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: d.delay },
            scale: { duration: 0.5, delay: d.delay },
            y: {
              duration: 4.2 + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: d.delay,
            },
          }}
        >
          <NupulIcon name={d.icon} size="lg" />
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 w-full max-w-md"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{
          opacity: exiting ? 0 : 1,
          y: exiting ? -14 : 0,
          scale: exiting ? 0.98 : 1,
        }}
        transition={{
          duration: exiting ? 0.5 : 0.55,
          ease: EASE_SMOOTH,
          delay: exiting ? 0 : 0.06,
        }}
      >
        <div className="text-center w-full">
          <motion.p
            className="text-caption font-bold tracking-widest text-nupul-green-dark uppercase"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: EASE_SMOOTH }}
          >
            {copy.headline}
          </motion.p>
          <motion.h2
            className="mt-2 text-h3 font-black text-nupul-dark"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45, ease: EASE_SMOOTH }}
          >
            {displayName}，稍候片刻
          </motion.h2>
          {tagline ? (
            <motion.p
              className="mt-1 text-caption font-semibold text-nupul-dark/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.4 }}
            >
              {tagline}
            </motion.p>
          ) : null}
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIndex}
              className="mt-2 text-body text-nupul-dark/75 font-medium min-h-[1.5em]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.42, ease: EASE_SMOOTH }}
            >
              {copy.lines[lineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="ip-run-progress mt-10 w-full">
          <div className="ip-run-track" aria-hidden>
            {MILESTONES.map((m) => (
              <span
                key={m}
                className={`ip-run-milestone ${hitMilestones.has(m) ? "is-hit" : ""}`}
                style={{ left: `${m}%` }}
              />
            ))}

            <motion.div
              className="ip-run-fill"
              initial={{ width: "0%" }}
              animate={{ width: exiting ? "100%" : "100%" }}
              transition={{
                duration: runSec,
                ease: EASE_RUN,
              }}
            />

            {[6, 12, 18].map((lag, i) => (
              <motion.span
                key={lag}
                className="ip-run-trail-dot"
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: "100%", opacity: [0, 1, 1] }}
                transition={{
                  duration: runSec,
                  ease: EASE_RUN,
                  delay: (lag / 100) * runSec,
                }}
                style={{ transitionDelay: `${i * 0.02}s` }}
              />
            ))}

            <motion.div
              className={`ip-run-runner-wrap ${celebrate ? "is-celebrate" : ""}`}
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: runSec,
                ease: EASE_RUN,
              }}
            >
              <div className="ip-run-runner-bob">
                <IpMascotRunnerFigure className="ip-run-runner-figure" />
              </div>
              <span className="ip-run-runner-shadow" aria-hidden />
            </motion.div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="ip-run-percent text-center text-caption font-mono font-bold text-nupul-dark/70 tabular-nums">
              {displayPct}%
            </p>
            {celebrate && !exiting ? (
              <motion.span
                className="text-caption font-bold text-nupul-green-dark"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                就绪 ✦
              </motion.span>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};
