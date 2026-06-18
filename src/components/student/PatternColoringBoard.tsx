import React, { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import {
  getPatternLineArtUrl,
  type ColoringPattern,
} from "../../data/coloringPatterns";
import { floodFillPattern } from "../../utils/patternFloodFill";

/** 内部渲染分辨率：矢量线稿栅格化后用于高清填色 */
const CANVAS_SIZE = 1024;

export type PatternStampExport = {
  code: string;
  x: number;
  y: number;
  size?: number;
};

export type PatternColoringBoardHandle = {
  exportPng: (stamps?: PatternStampExport[]) => string | null;
  clearFills: () => void;
};

type PatternColoringBoardProps = {
  pattern: ColoringPattern;
  selectedColor: string;
  children?: React.ReactNode;
  onContainerPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onContainerPointerUp?: () => void;
};

export const PatternColoringBoard = React.forwardRef<
  PatternColoringBoardHandle,
  PatternColoringBoardProps
>(function PatternColoringBoard(
  { pattern, selectedColor, children, onContainerPointerMove, onContainerPointerUp },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineArtRef = useRef<HTMLImageElement | null>(null);

  const drawLineArt = useCallback(() => {
    const canvas = canvasRef.current;
    const img = lineArtRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const scale = Math.min(
      CANVAS_SIZE / img.naturalWidth,
      CANVAS_SIZE / img.naturalHeight,
    );
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (CANVAS_SIZE - w) / 2;
    const y = (CANVAS_SIZE - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      lineArtRef.current = img;
      drawLineArt();
    };
    img.src = getPatternLineArtUrl(pattern);
    lineArtRef.current = null;
  }, [pattern.id, pattern.imageUrl, pattern.vectorUrl, drawLineArt]);

  useImperativeHandle(ref, () => ({
    exportPng: (stamps = []) => {
      const source = canvasRef.current;
      if (!source) return null;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_SIZE;
      exportCanvas.height = CANVAS_SIZE;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(source, 0, 0);

      for (const stamp of stamps) {
        const stampSize = stamp.size || 48;
        const px = (stamp.x / 100) * CANVAS_SIZE;
        const py = (stamp.y / 100) * CANVAS_SIZE;
        const fontSize = stampSize * 0.45;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, stampSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fill();
        ctx.strokeStyle = "#3b2e0b";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = `${fontSize}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#3b2e0b";
        ctx.fillText("纹", px, py);
        ctx.restore();
      }

      return exportCanvas.toDataURL("image/png");
    },
    clearFills: () => drawLineArt(),
  }));

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    floodFillPattern(ctx, x, y, selectedColor, CANVAS_SIZE, CANVAS_SIZE);
  };

  return (
    <div
      className="relative w-full aspect-square"
      onPointerMove={onContainerPointerMove}
      onPointerUp={onContainerPointerUp}
      onPointerLeave={onContainerPointerUp}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onPointerDown={handlePointerDown}
        className="w-full h-full rounded-[32px] border-4 border-nupul-dark bg-white cursor-crosshair touch-none"
        aria-label={`填色画板：${pattern.name}`}
      />
      {children}
    </div>
  );
});
