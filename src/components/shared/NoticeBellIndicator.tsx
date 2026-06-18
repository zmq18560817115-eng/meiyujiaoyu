import React from "react";
import { NupulIcon } from "../icons";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

type BellSize = "md" | "lg";

const BELL_SIZES: Record<BellSize, { box: string; icon: string; dot: string }> =
  {
    md: { box: "w-8 h-8", icon: "w-5 h-5", dot: "w-3 h-3" },
    lg: { box: "w-9 h-9", icon: "w-6 h-6", dot: "w-3.5 h-3.5" },
  };

interface NoticeBellIndicatorProps {
  size?: BellSize;
  className?: string;
  title?: string;
}

/** 通知栏顶栏：铃铛 + 红色圆点警醒 */
export const NoticeBellIndicator: React.FC<NoticeBellIndicatorProps> = ({
  size = "lg",
  className,
  title = "有新通知",
}) => {
  const s = BELL_SIZES[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        s.box,
        className,
      )}
      title={title}
      aria-label={title}
    >
      <NupulIcon
        name="notifications"
        className={cn(s.icon, "text-nupul-dark/80")}
      />
      <span
        className={cn(
          "absolute -top-0.5 -right-0.5 rounded-full bg-[#e53e3e] border-2 border-white",
          s.dot,
        )}
        aria-hidden
      />
    </span>
  );
};
