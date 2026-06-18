import React from "react";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/** 导航标签变体：primary 顶栏主 Tab；tertiary / quaternary 子页 SubPageNav */
export type NavTabVariant = "primary" | "tertiary" | "quaternary";

export type NavTabSize = "md" | "lg";

/** segment = 一级胶囊分段；underline = 二级下划线 Tab */
export type NavTabAppearance = "segment" | "underline";

function getUnderlineNavTabButtonClass(
  isActive: boolean,
  variant: NavTabVariant,
  stretch: boolean,
): string {
  const motion = cn(
    "relative inline-flex items-center justify-center border-b-2 -mb-px transition-colors duration-200 ease-in-out cursor-pointer whitespace-nowrap",
    stretch && "flex-1 min-w-0",
  );

  const sizeClass =
    variant === "quaternary"
      ? "text-caption py-2 px-1 sm:px-2 gap-1"
      : "text-secondary py-2.5 px-1 sm:px-2 gap-1.5";

  if (isActive) {
    return cn(
      motion,
      sizeClass,
      "font-bold text-nupul-green-dark border-nupul-green-dark",
    );
  }

  return cn(
    motion,
    sizeClass,
    "font-normal text-nupul-dark/50 border-transparent hover:text-nupul-dark/70",
  );
}

/**
 * 胶囊分段 Tab（一级）：选中暖黄底 + 描边 + 加粗
 * 下划线 Tab（二级）：选中绿色字 + 底边强调线 + 加粗
 */
export function getNavTabButtonClass(
  isActive: boolean,
  variant: NavTabVariant = "primary",
  size: NavTabSize = "md",
  stretch = false,
  appearance: NavTabAppearance = "segment",
): string {
  if (appearance === "underline") {
    return getUnderlineNavTabButtonClass(isActive, variant, stretch);
  }

  const motion = cn(
    "relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out cursor-pointer whitespace-nowrap",
    stretch && "flex-1 min-w-0",
  );

  const sizeClass =
    variant === "quaternary"
      ? stretch
        ? "text-caption py-2 px-3 sm:px-4 gap-1"
        : "text-caption py-1.5 px-3 gap-1"
      : size === "lg"
        ? "text-secondary py-2 px-3.5 sm:px-4 gap-1.5"
        : variant === "tertiary"
          ? stretch
            ? "text-secondary py-2.5 px-4 sm:px-5 gap-1.5"
            : "text-secondary py-2 px-3.5 sm:px-4 gap-1.5"
          : stretch
            ? "text-caption sm:text-secondary py-2 px-2.5 sm:px-3.5 gap-1"
            : "text-secondary py-2 px-3.5 sm:px-4 gap-1.5";

  if (isActive) {
    return cn(
      motion,
      sizeClass,
      "font-bold bg-nupul-yellow text-nupul-dark border-nupul-dark",
    );
  }

  return cn(
    motion,
    sizeClass,
    "font-normal bg-transparent text-nupul-dark/55 border-transparent hover:text-nupul-dark/80 hover:bg-nupul-soft-yellow",
  );
}

interface NavTabBarProps {
  children: React.ReactNode;
  className?: string;
  /** 主顶栏导航：更大胶囊外框 */
  prominent?: boolean;
  /** 横向铺满容器，各 Tab 等分宽度 */
  fullWidth?: boolean;
  appearance?: NavTabAppearance;
  /** @deprecated 保留兼容 */
  tone?: "primary" | "inset";
}

export const NavTabBar: React.FC<NavTabBarProps> = ({
  children,
  className,
  prominent = false,
  fullWidth = false,
  appearance = "segment",
}) => (
  <nav
    className={cn(
      appearance === "underline"
        ? cn(
            "flex items-end border-b-2 border-nupul-dark",
            fullWidth
              ? "w-full gap-x-0 sm:gap-x-2 flex-nowrap overflow-x-auto"
              : "inline-flex flex-wrap gap-x-5 sm:gap-x-6",
          )
        : cn(
            "flex items-stretch rounded-full bg-white border-2 border-nupul-dark",
            fullWidth
              ? "w-full gap-0.5 sm:gap-1 flex-nowrap overflow-x-auto"
              : "inline-flex flex-wrap gap-0.5 sm:gap-1",
            prominent ? "p-1 sm:p-1.5" : "p-1 sm:p-1.5",
          ),
      className,
    )}
    aria-label="页面导航"
  >
    {children}
  </nav>
);

interface NavTabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: NavTabVariant;
  size?: NavTabSize;
  className?: string;
  stretch?: boolean;
  appearance?: NavTabAppearance;
}

export function NavTabButton({
  active,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className,
  stretch = false,
  appearance = "segment",
}: NavTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        getNavTabButtonClass(active, variant, size, stretch, appearance),
        className,
      )}
    >
      {children}
    </button>
  );
}
