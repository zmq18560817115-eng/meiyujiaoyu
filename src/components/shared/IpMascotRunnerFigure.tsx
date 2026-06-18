/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface IpMascotRunnerFigureProps {
  className?: string;
}

/** 矢量 SVG IP（6× 预翻转位图，侧脸朝右沿进度条奔跑）。 */
export const IpMascotRunnerFigure: React.FC<IpMascotRunnerFigureProps> = ({
  className,
}) => (
  <svg
    viewBox="0 0 275 572"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
    focusable="false"
  >
    <image
      href="/ip-mascot-cutout-hd-right.png"
      width="275"
      height="572"
      preserveAspectRatio="xMidYMid meet"
    />
  </svg>
);
