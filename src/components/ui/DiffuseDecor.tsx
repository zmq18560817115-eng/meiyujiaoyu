import React from "react";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export type DiffuseColor = "yellow" | "green";
export type DiffuseCorner = "tr" | "tl" | "bl" | "br";
export type DiffuseSize = "sm" | "md" | "lg";

export interface DiffuseDecorProps {
  /** 角向弥散：tr/tl/bl/br + 黄/绿 */
  corner?: DiffuseCorner;
  /** 游离光斑（侧缘点缀） */
  dot?: boolean;
  color?: DiffuseColor;
  size?: DiffuseSize;
  /** 内嵌模式：不溢出容器，适合 overflow-hidden 父级 */
  inset?: boolean;
  /** 更淡的强度，用于信息密集区域 */
  soft?: boolean;
  className?: string;
}

function cornerClass(corner: DiffuseCorner, color: DiffuseColor): string {
  return `nupul-diffuse--${corner} nupul-diffuse--${corner}-${color}`;
}

function dotClass(color: DiffuseColor): string {
  return `nupul-diffuse--dot nupul-diffuse--dot-${color}`;
}

/**
 * 浅色弥散装饰：无描边柔和光晕，用于功能区块外角/侧缘点缀。
 * 父容器需 `relative`；装饰层 `pointer-events-none` + `z-0`。
 */
export const DiffuseDecor: React.FC<DiffuseDecorProps> = ({
  corner,
  dot = false,
  color = "yellow",
  size = "md",
  inset = false,
  soft = false,
  className,
}) => {
  if (!corner && !dot) return null;

  return (
    <div
      className={cn(
        "nupul-diffuse",
        corner && cornerClass(corner, color),
        dot && dotClass(color),
        size !== "md" && `nupul-diffuse--${size}`,
        inset && "nupul-diffuse--inset",
        soft && "nupul-diffuse--soft",
        className,
      )}
      aria-hidden
    />
  );
};

interface DiffuseHostProps {
  children: React.ReactNode;
  className?: string;
  /** 内容层 class，默认 relative z-10 */
  contentClassName?: string;
  accents?: Array<
    Omit<DiffuseDecorProps, "className"> & { className?: string }
  >;
}

/** 带弥散装饰的相对定位容器 */
export const DiffuseHost: React.FC<DiffuseHostProps> = ({
  children,
  className,
  contentClassName = "relative z-10",
  accents = [],
}) => (
  <div className={cn("relative", className)}>
    {accents.map((accent, index) => (
      <DiffuseDecor key={index} {...accent} />
    ))}
    <div className={contentClassName}>{children}</div>
  </div>
);

/** 常用弥散组合预设 */
export const DIFFUSE_PRESETS = {
  welcomeTeacher: [
    { corner: "tr" as const, color: "yellow" as const },
    { dot: true, color: "green" as const, className: "bottom-24 -left-3" },
  ],
  welcomeStudent: [
    { corner: "tr" as const, color: "green" as const },
    { dot: true, color: "yellow" as const, className: "bottom-24 -right-2" },
  ],
  mainPanel: [
    { corner: "tr" as const, color: "yellow" as const, inset: true, soft: true, size: "lg" as const },
    { dot: true, color: "green" as const, inset: true, soft: true, className: "bottom-6 left-2" },
  ],
  studio: [
    { corner: "tr" as const, color: "yellow" as const, inset: true },
    { dot: true, color: "green" as const, className: "bottom-8 -left-2" },
  ],
  chatSide: [
    { dot: true, color: "green" as const, soft: true, className: "top-8 -left-3" },
  ],
  chatMain: [
    { corner: "tr" as const, color: "yellow" as const, inset: true, soft: true, size: "sm" as const },
  ],
  panoramaView: [
    { corner: "tr" as const, color: "yellow" as const, inset: true, soft: true },
    { corner: "bl" as const, color: "green" as const, inset: true, soft: true, size: "sm" as const },
  ],
  panoramaStage: [
    { corner: "tr" as const, color: "green" as const, inset: true, soft: true },
    { corner: "bl" as const, color: "yellow" as const, inset: true, soft: true, size: "sm" as const },
  ],
  stats: [
    { corner: "tr" as const, color: "yellow" as const, inset: true, soft: true },
    { corner: "bl" as const, color: "green" as const, inset: true, soft: true, size: "sm" as const },
  ],
  toolCard: (index: number) => [
    {
      corner: "tr" as const,
      color: (index % 2 === 0 ? "yellow" : "green") as DiffuseColor,
      inset: true,
      soft: true,
      size: "sm" as const,
    },
  ],
  galleryCard: [
    { corner: "tr" as const, color: "yellow" as const, inset: true, soft: true, size: "sm" as const },
  ],
  loginTeacher: [
    { corner: "tr" as const, color: "yellow" as const, inset: true },
    { dot: true, color: "green" as const, className: "bottom-16 -left-2" },
  ],
  loginStudent: [
    { corner: "tr" as const, color: "green" as const, inset: true },
    { dot: true, color: "yellow" as const, className: "bottom-16 -right-2" },
  ],
};

export function renderDiffuseAccents(
  accents: Array<Omit<DiffuseDecorProps, "className"> & { className?: string }>,
) {
  return accents.map((accent, index) => (
    <DiffuseDecor key={index} {...accent} />
  ));
}
