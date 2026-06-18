import React from "react";
import { BrandLogo } from "./BrandLogo";
import { renderDiffuseAccents } from "../ui/DiffuseDecor";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

interface PortalTopBarProps {
  nav: React.ReactNode;
  actions: React.ReactNode;
  onLogoClick?: () => void;
  className?: string;
}

/**
 * 白底圆角顶栏，滚动时固定在页面顶部
 */
export const PortalTopBar: React.FC<PortalTopBarProps> = ({
  nav,
  actions,
  onLogoClick,
  className,
}) => (
  <div
    className={cn(
      "sticky top-0 z-50 px-3 md:px-5 pt-2 pb-2",
      "bg-[var(--color-page-bg)]",
      className,
    )}
  >
    <div className="w-full max-w-6xl mx-auto">
      <div
        className={cn(
          "relative bg-white rounded-[var(--radius-card)] border border-nupul-dark overflow-visible",
          "px-2.5 py-2 sm:px-4 sm:py-2.5",
        )}
      >
        {renderDiffuseAccents([
          { corner: "tr", color: "yellow", inset: true, soft: true, size: "sm" },
          { corner: "bl", color: "green", inset: true, soft: true, size: "sm" },
        ])}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer"
          >
            <BrandLogo size="sm" className="shrink-0" />
            <div className="hidden sm:block min-w-0">
              <span className="text-display-sm font-bold tracking-wide leading-none text-nupul-dark block">
                青墙粉绘
              </span>
            </div>
          </button>

          <div className="flex-1 min-w-0 w-full">{nav}</div>

          <div className="relative z-20 flex flex-wrap items-center justify-end gap-2 shrink-0 overflow-visible">
            {actions}
          </div>
        </div>
      </div>
    </div>
  </div>
);
