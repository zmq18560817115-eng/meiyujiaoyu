import React from "react";
import logoCutout from "../../assets/qingqiang-logo-cutout.png";

const SIZE_CLASS = {
  sm: "h-9 w-auto",
  md: "h-14 w-auto",
  lg: "h-44 w-auto sm:h-48",
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  alt?: string;
}

/** 青墙粉绘 · 白族照壁标识（透明底） */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "sm",
  className = "",
  alt = "青墙粉绘标识",
}) => (
  <img
    src={logoCutout}
    alt={alt}
    className={`${SIZE_CLASS[size]} object-contain object-center bg-transparent select-none ${className}`}
    draggable={false}
    decoding="async"
  />
);
