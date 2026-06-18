import React from "react";

type CategoryTagVariant = "accent" | "brand";

type StatusTagVariant = "warning" | "success" | "neutral" | "danger";

interface CategoryTagProps {
  children: React.ReactNode;
  variant?: CategoryTagVariant;
  className?: string;
}

interface StatusTagProps {
  children: React.ReactNode;
  variant?: StatusTagVariant;
  className?: string;
}

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const CategoryTag: React.FC<CategoryTagProps> = ({
  children,
  variant = "accent",
  className,
}) => (
  <span
    className={cn(
      "ds-tag-category",
      variant === "brand" && "ds-tag-category--brand",
      variant === "accent" && "ds-tag-category--accent",
      className,
    )}
  >
    {children}
  </span>
);

export const StatusTag: React.FC<StatusTagProps> = ({
  children,
  variant = "neutral",
  className,
}) => (
  <span
    className={cn(
      "ds-tag-status",
      variant === "warning" && "ds-tag-status--warning",
      variant === "success" && "ds-tag-status--success",
      variant === "danger" && "ds-tag-status--danger",
      variant === "neutral" && "ds-tag-status--neutral",
      className,
    )}
  >
    {children}
  </span>
);
