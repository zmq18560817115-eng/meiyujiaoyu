import React from "react";
import { NavTabBar, getNavTabButtonClass } from "../ui/NavTab";
import { StatusTag } from "../ui/Tag";
import { NupulIcon, type NupulIconName } from "../icons";

export type SubNavItem = {
  id: string;
  label: string;
  badge?: string;
  icon?: NupulIconName;
};

interface SubPageNavProps {
  items: SubNavItem[];
  active: string;
  onChange: (id: string) => void;
  level?: "tertiary" | "quaternary";
  className?: string;
  /** 横向铺满内容区，各 Tab 等分（默认开启） */
  fullWidth?: boolean;
}

export const SubPageNav: React.FC<SubPageNavProps> = ({
  items,
  active,
  onChange,
  level = "tertiary",
  className,
  fullWidth = true,
}) => {
  const variant = level === "quaternary" ? "quaternary" : "tertiary";
  return (
    <NavTabBar
      appearance="underline"
      fullWidth={fullWidth}
      className={className ?? "mb-3 w-full"}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={getNavTabButtonClass(
              isActive,
              variant,
              "md",
              fullWidth,
              "underline",
            )}
          >
            {item.icon && (
              <NupulIcon name={item.icon} size="sm" className="opacity-80" />
            )}
            {item.label}
            {item.badge && (
              <StatusTag variant="danger" className="ml-1">
                {item.badge}
              </StatusTag>
            )}
          </button>
        );
      })}
    </NavTabBar>
  );
};

interface PageBreadcrumbProps {
  segments: string[];
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ segments }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-caption font-semibold text-nupul-dark/55 mb-3">
    {segments.map((seg, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span className="text-nupul-dark/30">›</span>}
        <span
          className={
            i === segments.length - 1 ? "text-nupul-green-dark font-bold" : ""
          }
        >
          {seg}
        </span>
      </span>
    ))}
  </div>
);

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  title,
  children,
  action,
}) => (
  <div className="bg-nupul-cream rounded-2xl border-3 border-nupul-dark p-4 space-y-3">
    <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-nupul-dark/15 pb-2">
      <h5 className="text-display-sm font-medium text-nupul-dark">{title}</h5>
      {action}
    </div>
    <div className="text-secondary">{children}</div>
  </div>
);

interface StatChipProps {
  label: string;
  value: string;
}

export const StatChip: React.FC<StatChipProps> = ({ label, value }) => (
  <div className="bg-white rounded-xl border-2 border-nupul-dark p-3">
    <span className="text-caption font-semibold text-nupul-dark/50 uppercase tracking-wider block">
      {label}
    </span>
    <span className="text-display-md font-bold text-nupul-dark mt-1 block">
      {value}
    </span>
  </div>
);
