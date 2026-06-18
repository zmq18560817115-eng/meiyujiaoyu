/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { renderDiffuseAccents } from "./ui/DiffuseDecor";

interface InkBleedLoaderProps {
  onComplete: () => void;
  studentName: string;
  patternName: string;
}

interface Step {
  title: string;
  desc: string;
  duration: number; // in ms
}

export const InkBleedLoader: React.FC<InkBleedLoaderProps> = ({
  onComplete,
  studentName,
  patternName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "第一阶段：揉捏绞扎 · 扎结封底",
      desc: "正在将您的数字作品进行传统手工艺‘揉捏结辫、卷皱缚扎’。用线束扎紧的部位，墨色无法侵入，形成原始的‘素白留底’...",
      duration: 1200,
    },
    {
      title: "第二阶段: 浸入染池 · 石青晕染",
      desc: "大作正落入板蓝根萃取的纯天然靛青（石青）染缸。青色顺着棉麻纤维细密扩散，正在经历极其神奇的‘墨迹晕染’物理渲染...",
      duration: 1400,
    },
    {
      title: "第三阶段: 空气氧化 · 青白对立",
      desc: "出缸见风，原本暗淡的黄绿染液在空气中开始氧化！清白分明、苍翠欲滴的‘大理苍洱蓝’魔幻般在宣纸与绢布上绽放现身...",
      duration: 1400,
    },
    {
      title: "第四阶段: 解结晒晾 · 礼成存证",
      desc: "细心解开绞绳，白族的吉祥飞蝶与富贵牡丹脱胎换骨。进行最后的脱水日晒漂洗！一幅完美的‘青墙粉绘’少儿大作登展入册...",
      duration: 1200,
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const runSteps = (index: number) => {
      if (index < steps.length) {
        timer = setTimeout(() => {
          setCurrentStep(index + 1);
          runSteps(index + 1);
        }, steps[index].duration);
      } else {
        // All steps successfully completed! Trigger final publishing completion callback
        onComplete();
      }
    };

    runSteps(0);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  const outlineNameChinese = patternName;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nupul-dark/80">
      {/* Outer elegant traditional cardboard panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-nupul-cream rounded-3xl border-4 border-nupul-dark overflow-hidden relative"
        id="ink-bleed-container"
      >
        {renderDiffuseAccents([
          { corner: "tr", color: "yellow", inset: true, soft: true },
          { corner: "bl", color: "green", inset: true, soft: true, size: "sm" },
        ])}

        {/* Header decoration */}
        <div className="text-center pt-8 px-6">
          <span className="text-caption font-mono tracking-widest text-[#a18262] uppercase block font-bold leading-none mb-1">
            Dali Tie-Dye Art Indigo Bleeding Engine
          </span>
          <h2 className="font-bold text-display-md text-[#1a365d] flex items-center justify-center gap-2">
            <span>板蓝靛青 · 墨迹晕染中</span>
          </h2>
          <p className="text-caption text-slate-500 mt-2">
            正在为极富造诣的创意小匠{" "}
            <strong className="text-nupul-orange">
              {studentName || "同胞学子"}
            </strong>{" "}
            的首创彩画线稿进行大理白族扎染植物活化处理...
          </p>
        </div>

        {/* The visual heart: Animating SVG blending circles using feTurbulence natural fractal noise */}
        <div className="my-6 relative flex justify-center items-center h-64 bg-[#eef2f3] rounded-2xl mx-10 border border-stone-800/10 overflow-hidden">
          {/* Natural hemp cloth grid texture overlay */}
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none"></div>

          {/* Canvas paper board frame */}
          <div className="absolute inset-4 rounded-xl border border-dashed border-stone-800/15 pointer-events-none"></div>

          {/* SVG Bleeding Art */}
          <svg
            viewBox="0 0 300 300"
            className="w-56 h-56 relative"
          >
            <defs>
              {/* Organic fractal noise filter creates ink washing and tie-dye bleed contours */}
              <filter
                id="dye-ink-filter animate-filter"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.035"
                  numOctaves="4"
                  result="turbulence"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="turbulence"
                  scale="32"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            {/* Simulated wooden tie-dye frame */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#8b5a2b"
              strokeWidth="3"
              opacity="0.4"
            />
            <circle
              cx="150"
              cy="150"
              r="134"
              fill="none"
              stroke="#8b5a2b"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.3"
            />

            <g filter="url(#dye-ink-filter)">
              {/* Main expanding blue bleed - starts tiny then expands organically */}
              <motion.circle
                cx="150"
                cy="150"
                initial={{ r: 4, opacity: 0 }}
                animate={{
                  r:
                    currentStep >= 1
                      ? [12, 55, 88, 110][Math.min(currentStep, 3)]
                      : 12,
                  opacity: currentStep >= 1 ? 0.88 : 0,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                fill="#1a365d" // 石青
              />

              {/* Sub-bleed centers for natural uneven knot spreading */}
              {currentStep >= 1 && (
                <>
                  <motion.circle
                    cx="110"
                    cy="130"
                    initial={{ r: 2, opacity: 0 }}
                    animate={{
                      r:
                        currentStep >= 2
                          ? [10, 42, 68][Math.min(currentStep - 1, 2)]
                          : 10,
                      opacity: 0.8,
                    }}
                    transition={{ duration: 1.8 }}
                    fill="#152e50"
                  />
                  <motion.circle
                    cx="190"
                    cy="170"
                    initial={{ r: 1, opacity: 0 }}
                    animate={{
                      r:
                        currentStep >= 2
                          ? [8, 48, 72][Math.min(currentStep - 1, 2)]
                          : 8,
                      opacity: 0.72,
                    }}
                    transition={{ duration: 1.4 }}
                    fill="#2c7a7b" // 松石绿 hue (Dali mineral green transition)
                  />
                  <motion.circle
                    cx="150"
                    cy="210"
                    initial={{ r: 1, opacity: 0 }}
                    animate={{
                      r:
                        currentStep >= 3
                          ? [6, 35][Math.min(currentStep - 2, 1)]
                          : 6,
                      opacity: 0.65,
                    }}
                    transition={{ duration: 1.2 }}
                    fill="#152e50"
                  />
                </>
              )}
            </g>

            {/* Immersive white outline of the actual artwork overlapping perfectly inside the bleeding ink! */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: currentStep >= 2 ? 0.28 : 0.05, scale: 1 }}
              transition={{ duration: 2 }}
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
              style={{ transformOrigin: "150px 150px" }}
            >
              <>
                <rect
                  x="70"
                  y="70"
                  width="160"
                  height="160"
                  rx="8"
                  strokeWidth="1"
                />
                <circle cx="150" cy="150" r="28" />
                <path d="M120 150 C100 130, 100 170, 120 150" />
                <path d="M180 150 C200 130, 200 170, 180 150" />
                <path d="M150 120 C130 100, 170 100, 150 120" />
                <path d="M150 180 C130 200, 170 200, 150 180" />
                <path d="M95 95 C110 85, 125 100, 95 95" />
                <path d="M205 205 C190 215, 175 200, 205 205" />
              </>
            </motion.g>

            {/* Auspicious cloud borders in high fidelity */}
            <path
              d="M100 240 C120 230, 130 250, 150 240 C170 230, 180 250, 200 240"
              fill="none"
              stroke="#2d3748"
              strokeWidth="1.2"
              opacity="0.25"
            />
          </svg>

          {/* Current action overlay badge */}
          <div className="absolute top-3 right-3 bg-[#1a365d] text-white py-1 px-3 rounded-full text-caption tracking-widest font-black border border-nupul-yellow">
            {outlineNameChinese} 扎染固化
          </div>

          {/* Liquid droplet ripple waves effect under text */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-700 animate-ping"></span>
            <span className="text-caption font-bold text-slate-600">
              板蓝靛液反应度 98.5%
            </span>
          </div>
        </div>

        {/* Process Roadmap List (Highly polished dynamic ticks) */}
        <div className="px-10 pb-6 space-y-3.5">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isCompleted || isActive ? 1 : 0.35, y: 0 }}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-nupul-yellow/10 border-nupul-yellow/30 ring-1 ring-nupul-yellow/20"
                    : isCompleted
                      ? "bg-nupul-green/5 border-nupul-green/20"
                      : "bg-stone-50 border-stone-200/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {isCompleted ? (
                      <div className="w-7 h-7 rounded-full bg-nupul-green border border-nupul-green-dark text-white flex items-center justify-center shrink-0 font-bold text-caption">
                        成
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-caption shrink-0 ${
                          isActive
                            ? "bg-nupul-yellow border-nupul-yellow text-[#4a3319] animate-pulse"
                            : "bg-white border-slate-300 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    )}

                    <h4
                      className={`text-caption font-bold leading-none ${
                        isActive
                          ? "text-nupul-dark text-secondary"
                          : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-caption text-slate-600 leading-relaxed mt-2 ml-9 pb-1"
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="bg-nupul-yellow/10 border-t border-nupul-dark/10 py-3.5 px-6 text-center text-caption text-nupul-dark font-bold">
          <span>
            友情美育小课堂：大理白族传统手工扎染以天然植物‘板蓝根’叶制成的蓝靛为染料，绿色健康。
          </span>
        </div>
      </motion.div>
    </div>
  );
};
