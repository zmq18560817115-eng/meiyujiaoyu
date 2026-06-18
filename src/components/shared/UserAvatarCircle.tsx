import React from "react";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

function getDisplayInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed.length >= 2 ? trimmed.slice(0, 2) : trimmed;
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

interface UserAvatarCircleProps {
  name: string;
  roleLabel?: string;
  loading?: boolean;
  className?: string;
  imageUrl?: string;
}

/** 圆形用户标识：姓名代称或头像 */
export const UserAvatarCircle: React.FC<UserAvatarCircleProps> = ({
  name,
  roleLabel,
  loading = false,
  className,
  imageUrl,
}) => {
  const label = loading ? "…" : getDisplayInitial(name);
  const title = loading
    ? "加载中"
    : roleLabel
      ? `${name} · ${roleLabel}`
      : name;

  return (
    <div
      className={cn("relative shrink-0", className)}
      title={title}
      aria-label={title}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full border-2 border-nupul-dark overflow-hidden",
          "flex items-center justify-center",
          imageUrl ? "bg-white" : "bg-nupul-yellow text-nupul-dark",
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-caption font-bold leading-none select-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
