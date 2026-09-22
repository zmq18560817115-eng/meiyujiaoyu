/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface IpMascotRunnerFigureProps {
  className?: string;
}

/** 登录进度条人物：直接使用图片，避免 SVG 内嵌 WebP 的兼容差异。 */
export const IpMascotRunnerFigure: React.FC<IpMascotRunnerFigureProps> = ({
  className,
}) => (
  <img
    src="/ip-mascot-cutout-hd-right.webp"
    alt=""
    className={className}
    width="275"
    height="572"
    decoding="sync"
    fetchPriority="high"
    aria-hidden="true"
  />
);
