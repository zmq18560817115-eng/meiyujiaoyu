/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

/** 08 ICON 图标系统 — 18 枚单色线框矢量图标 */
export type NupulIconName =
  | "home"
  | "course"
  | "brush"
  | "pattern"
  | "user"
  | "cloud"
  | "palette"
  | "tools"
  | "back"
  | "video"
  | "cube"
  | "search"
  | "settings"
  | "notifications"
  | "favorites"
  | "messages"
  | "share"
  | "more";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const SIZE_CLASS = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
} as const;

export type NupulIconSize = keyof typeof SIZE_CLASS;

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconPaths({ name }: { name: NupulIconName }) {
  switch (name) {
    case "home":
      return (
        <>
          <path {...STROKE} d="M4 10.5V19h5v-6h6v6h5v-8.5" />
          <path {...STROKE} d="M3 11.5 12 4l9 7.5" />
        </>
      );
    case "course":
      return (
        <>
          <path {...STROKE} d="M12 5.5v13" />
          <path {...STROKE} d="M12 5.5C9.2 4.2 5.5 4.2 3.5 5.5v12.8c2-1.2 5.5-1.2 8.5 0" />
          <path {...STROKE} d="M12 5.5c2.8-1.3 6.5-1.3 8.5 0v12.8c-2-1.2-5.5-1.2-8.5 0" />
        </>
      );
    case "brush":
      return (
        <>
          <path {...STROKE} d="M5.5 18.5 15 9" />
          <path {...STROKE} d="M15 9l3.5-3.5" />
          <path {...STROKE} d="M4 20 2.5 21.5" />
          <path {...STROKE} d="M16.5 6.5 19 4" />
        </>
      );
    case "pattern":
      return (
        <>
          <rect {...STROKE} x="4" y="5" width="16" height="14" rx="1.5" />
          <path {...STROKE} d="M7 16l4-5 3 3.5L17 10" />
          <circle {...STROKE} cx="16" cy="9" r="1.2" />
        </>
      );
    case "user":
      return (
        <>
          <circle {...STROKE} cx="12" cy="8.5" r="3" />
          <path {...STROKE} d="M5.5 19.5c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5" />
        </>
      );
    case "cloud":
      return (
        <path
          {...STROKE}
          d="M12 4.5c-2.2 0-4 1.5-4.5 3.5-2 .5-3.5 2.2-3.5 4.2 0 2.3 1.9 4.3 4.2 4.3h7.6c2 0 3.7-1.6 3.7-3.7 0-2-1.5-3.6-3.4-3.9-.6-2.4-2.8-4.1-5.3-4.1-.8 0-1.5.2-2.2.5-.5-1.8-2.1-3-4.1-3z"
        />
      );
    case "palette":
      return (
        <>
          <path
            {...STROKE}
            d="M12 4.5c-4.5 0-7.5 2.8-7.5 6.2 0 3.2 2.8 5.8 6.5 5.8.9 0 1.7-.2 2.4-.5 1-.5 1.6-1.5 1.6-2.6 0-1.8-1.5-3.2-3.3-3.2-.6 0-1.1.2-1.5.5"
          />
          <circle fill="currentColor" cx="8" cy="9" r="0.9" />
          <circle fill="currentColor" cx="10.5" cy="7" r="0.9" />
          <circle fill="currentColor" cx="13.5" cy="7.5" r="0.9" />
        </>
      );
    case "tools":
      return (
        <path
          {...STROKE}
          d="M15.2 5.2a3.4 3.4 0 00-4.8 4.8L6.2 14.2l3.6 3.6 4.1-4.1a3.4 3.4 0 004.8-4.8L19 7.8 15.2 5.2z"
        />
      );
    case "back":
      return (
        <path
          {...STROKE}
          d="M9 6.5 4.5 12 9 17.5M4.5 12H18"
        />
      );
    case "video":
      return (
        <>
          <rect {...STROKE} x="4" y="6" width="16" height="12" rx="2" />
          <path {...STROKE} d="M11 9.5v5l5-2.5-5-2.5z" fill="currentColor" stroke="none" />
        </>
      );
    case "cube":
      return (
        <>
          <path {...STROKE} d="M12 4.5 19 8.5v7L12 19.5 5 15.5v-7L12 4.5z" />
          <path {...STROKE} d="M12 4.5v15M5 8.5l7 4 7-4" />
        </>
      );
    case "search":
      return (
        <>
          <circle {...STROKE} cx="10.5" cy="10.5" r="5.5" />
          <path {...STROKE} d="M15 15 19 19" />
        </>
      );
    case "settings":
      return (
        <>
          <circle {...STROKE} cx="12" cy="12" r="2.5" />
          <path
            {...STROKE}
            d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
          />
        </>
      );
    case "notifications":
      return (
        <>
          <path
            {...STROKE}
            d="M12 4.5a4 4 0 00-4 4v2.2L6.5 13.5h11L14.5 10.7V8.5a4 4 0 00-4-4z"
          />
          <path {...STROKE} d="M10 16.5a2 2 0 004 0" />
        </>
      );
    case "favorites":
      return (
        <path
          {...STROKE}
          d="M12 4.5 14.2 9l5 .7-3.7 3.5 1 4.8L12 15.8 7.5 17.9l1-4.8L4.8 9.7l5-.7L12 4.5z"
        />
      );
    case "messages":
      return (
        <path
          {...STROKE}
          d="M5 5.5h14a2 2 0 012 2v7a2 2 0 01-2 2H10l-5 3.5V7.5a2 2 0 012-2z"
        />
      );
    case "share":
      return (
        <>
          <path {...STROKE} d="M8 14.5V7.5l8-3" />
          <path {...STROKE} d="M16 4.5v6M16 4.5l2.5 2.5M16 4.5 13.5 7" />
        </>
      );
    case "more":
      return (
        <>
          <circle fill="currentColor" cx="6" cy="12" r="1.2" />
          <circle fill="currentColor" cx="12" cy="12" r="1.2" />
          <circle fill="currentColor" cx="18" cy="12" r="1.2" />
        </>
      );
    default:
      return null;
  }
}

export interface NupulIconProps {
  name: NupulIconName;
  size?: NupulIconSize;
  className?: string;
  title?: string;
}

export const NupulIcon: React.FC<NupulIconProps> = ({
  name,
  size = "md",
  className,
  title,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn(SIZE_CLASS[size], "shrink-0", className)}
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    aria-label={title}
  >
    <IconPaths name={name} />
  </svg>
);

export function NavIconLabel({
  icon,
  children,
  className,
}: {
  icon: NupulIconName;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <NupulIcon name={icon} size="sm" className="opacity-85" />
      <span>{children}</span>
    </span>
  );
}

export function BackButtonLabel({
  label = "返回",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <NupulIcon name="back" size="sm" />
      <span>{label}</span>
    </span>
  );
}
