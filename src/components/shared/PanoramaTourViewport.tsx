import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PANORAMA_VIEWS,
  type PanoramaView,
  type PanoramaViewId,
} from "../../data/panoramaViews";
import {
  DIFFUSE_PRESETS,
  renderDiffuseAccents,
} from "../ui/DiffuseDecor";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const PANORAMA_PLACEHOLDER = "/ppt-knowledge/images/placeholder-mural.svg";

type PanoramaTourVariant = "stage" | "light";

interface PanoramaTourViewportProps {
  activeViewId: PanoramaViewId;
  onViewChange: (id: PanoramaViewId) => void;
  /** 教师端深色舞台 / 学生端浅色实景 */
  variant?: PanoramaTourVariant;
  className?: string;
  minHeight?: string;
  /** 学生端等窄屏：固定视口高度，避免 16:9 撑满整页 */
  compact?: boolean;
  /** 全屏沉浸模式：撑满高度、隐藏画面内说明文字 */
  immersive?: boolean;
}

export function PanoramaTourViewport({
  activeViewId,
  onViewChange,
  variant = "stage",
  className,
  minHeight = "min-h-[400px]",
  compact = false,
  immersive = false,
}: PanoramaTourViewportProps) {
  const activeView = PANORAMA_VIEWS.find((v) => v.id === activeViewId)!;
  const isStage = variant === "stage";
  const useAspectVideo = Boolean(className?.includes("aspect-video"));
  const layoutClass = className
    ?.split(/\s+/)
    .filter((token) => token && token !== "aspect-video")
    .join(" ");

  const imageAreaClass = cn(
    "relative w-full overflow-hidden",
    immersive && "flex-1 min-h-0",
    !immersive &&
      compact &&
      "h-[clamp(180px,28vh,300px)] md:h-[clamp(200px,32vh,280px)]",
    !immersive &&
      !compact &&
      useAspectVideo &&
      "aspect-video max-h-[min(40vh,360px)]",
    !immersive &&
      !compact &&
      !useAspectVideo &&
      minHeight,
    !immersive &&
      !compact &&
      !useAspectVideo &&
      minHeight === "min-h-0" &&
      "min-h-[240px] sm:min-h-[280px]",
    !immersive &&
      !compact &&
      !useAspectVideo &&
      minHeight !== "min-h-0" &&
      "min-h-[300px] sm:min-h-[340px]",
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border-3 border-nupul-dark",
        isStage ? "bg-slate-900" : "bg-nupul-cream",
        immersive ? "h-full min-h-0" : "w-full",
        layoutClass,
        immersive && className,
      )}
    >
      {renderDiffuseAccents(
        isStage ? DIFFUSE_PRESETS.panoramaStage : DIFFUSE_PRESETS.panoramaView,
      )}
      {/* 视角画面（16:9 仅作用于画面区，导航栏在其下方独立展示） */}
      <div className={imageAreaClass}>
        {isStage && (
          <div className="absolute inset-0 bg-radial-gradient from-slate-850 to-slate-950 opacity-40 pointer-events-none" />
        )}

        <div
          className={cn(
            "absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full border text-caption font-semibold",
            isStage
              ? "bg-black/70 text-nupul-green border-nupul-green"
              : "bg-white/90 text-nupul-green-dark border-nupul-green-dark/25",
          )}
        >
          <span className="w-2 h-2 rounded-full bg-nupul-green animate-pulse shrink-0" />
          <span>白族墙绘 · 多方位环视导览</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={activeView.image}
              alt={activeView.title}
              className="w-full h-full object-cover bg-nupul-cream"
              draggable={false}
              onError={(e) => {
                if (e.currentTarget.src.endsWith(PANORAMA_PLACEHOLDER)) return;
                e.currentTarget.src = PANORAMA_PLACEHOLDER;
              }}
            />
            {!isStage && (
              <div className="absolute inset-0 bg-nupul-dark/10 pointer-events-none" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 画面内导览热点 */}
        {activeView.links.map((link) => (
          <button
            key={`${activeView.id}-${link.targetId}-${link.label}`}
            type="button"
            onClick={() => onViewChange(link.targetId)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: link.x, top: link.y }}
            title={link.label}
            aria-label={`切换到${link.label}`}
          >
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  link.targetId === activeViewId
                    ? "bg-nupul-yellow"
                    : "bg-nupul-green",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-7 w-7 rounded-full border-2 border-nupul-dark items-center justify-center",
                  link.targetId === activeViewId
                    ? "bg-nupul-yellow"
                    : "bg-nupul-green/90",
                )}
              >
                <span className="w-2 h-2 rounded-full bg-white/90" />
              </span>
            </span>
            <span
              className={cn(
                "absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                isStage
                  ? "bg-black/75 text-white"
                  : "bg-white text-nupul-dark border border-nupul-dark/20",
              )}
            >
              {link.label}
            </span>
          </button>
        ))}

      </div>

      {/* 底部视角切换条：独立于画面区下方 */}
      <ViewNavBar
        activeViewId={activeViewId}
        onViewChange={onViewChange}
        variant={variant}
        immersive={immersive}
      />
    </div>
  );
}

function ViewNavBar({
  activeViewId,
  onViewChange,
  variant,
  immersive = false,
}: {
  activeViewId: PanoramaViewId;
  onViewChange: (id: PanoramaViewId) => void;
  variant: PanoramaTourVariant;
  immersive?: boolean;
}) {
  const isStage = variant === "stage";

  return (
    <div
      className={cn(
        "panorama-view-dock relative shrink-0 flex gap-2 overflow-x-auto",
        immersive ? "p-2.5 sm:p-3" : "px-2 py-2 sm:px-2.5 sm:py-2",
        !isStage && "panorama-view-dock--student",
        isStage && "panorama-view-dock--stage",
      )}
      role="tablist"
      aria-label="环视视角切换"
    >
      {!isStage &&
        renderDiffuseAccents([
          { corner: "bl", color: "green", inset: true, soft: true, size: "sm" },
          { corner: "br", color: "yellow", inset: true, soft: true, size: "sm" },
        ])}
      <div className="relative z-10 flex gap-2 min-w-max">
        {PANORAMA_VIEWS.map((view) => {
          const active = view.id === activeViewId;
          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onViewChange(view.id)}
              className={cn(
                "shrink-0 rounded-full border-2 px-2.5 sm:px-3 py-1 text-[11px] sm:text-caption font-bold transition cursor-pointer whitespace-nowrap",
                active
                  ? "bg-white text-nupul-dark border-white"
                  : "bg-transparent text-white border-white/60 hover:border-white hover:bg-white/10",
              )}
            >
              {view.navLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getPanoramaView(id: PanoramaViewId): PanoramaView {
  return PANORAMA_VIEWS.find((v) => v.id === id)!;
}
