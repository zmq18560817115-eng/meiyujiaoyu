import React from "react";
import logoCutout from "../../assets/zhimei-education-logo.png";

const SIZE_CLASS = {
  sm: "h-10 w-16 sm:w-20",
  md: "h-16 w-24",
  lg: "h-44 w-64 sm:h-48 sm:w-72",
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  alt?: string;
}

/** 智美教育系统统一品牌标识 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "sm",
  className = "",
  alt = "智美教育系统标识",
}) => (
  <img
    src={logoCutout}
    alt={alt}
    className={`${SIZE_CLASS[size]} object-contain object-center bg-transparent select-none ${className}`}
    draggable={false}
    decoding="async"
  />
);
