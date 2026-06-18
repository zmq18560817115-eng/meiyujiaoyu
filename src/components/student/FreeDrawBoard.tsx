import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const CANVAS_SIZE = 1024;

export type FreeDrawBoardHandle = {
  exportPng: () => string | null;
  clear: () => void;
};

type FreeDrawBoardProps = {
  selectedColor: string;
};

export const FreeDrawBoard = React.forwardRef<
  FreeDrawBoardHandle,
  FreeDrawBoardProps
>(function FreeDrawBoard({ selectedColor }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [drawMode, setDrawMode] = useState<"pen" | "eraser">("pen");
  const [brushSize, setBrushSize] = useState(8);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = "rgba(59, 46, 11, 0.08)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      const p = (CANVAS_SIZE / 4) * i;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(CANVAS_SIZE, p);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const strokeBetween = (
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    if (drawMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pos = toCanvasPoint(e);
    lastPosRef.current = pos;
    strokeBetween(pos, { x: pos.x + 0.1, y: pos.y + 0.1 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const pos = toCanvasPoint(e);
    strokeBetween(lastPosRef.current, pos);
    lastPosRef.current = pos;
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawingRef.current) {
      drawingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  useImperativeHandle(ref, () => ({
    exportPng: () => canvasRef.current?.toDataURL("image/png") ?? null,
    clear: () => initCanvas(),
  }));

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2 bg-white border-2 border-nupul-dark/15 rounded-xl p-2">
        <button
          type="button"
          onClick={() => setDrawMode("pen")}
          className={`text-caption font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer transition ${
            drawMode === "pen"
              ? "bg-nupul-yellow border-nupul-dark text-nupul-dark"
              : "bg-white border-nupul-dark/20 text-nupul-dark/70"
          }`}
        >
          画笔
        </button>
        <button
          type="button"
          onClick={() => setDrawMode("eraser")}
          className={`text-caption font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer transition ${
            drawMode === "eraser"
              ? "bg-nupul-yellow border-nupul-dark text-nupul-dark"
              : "bg-white border-nupul-dark/20 text-nupul-dark/70"
          }`}
        >
          橡皮
        </button>
        <label className="flex items-center gap-2 text-caption font-bold text-nupul-dark/80 ml-auto min-w-[140px]">
          <span className="shrink-0">笔触</span>
          <input
            type="range"
            min={3}
            max={28}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="flex-1 h-1 accent-nupul-green"
          />
          <span className="font-mono text-[10px] w-5">{brushSize}</span>
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
        className="w-full aspect-square rounded-[32px] border-4 border-nupul-dark bg-white cursor-crosshair touch-none"
        aria-label="自主创作画板"
      />
      <p className="text-caption text-nupul-dark/55 font-semibold text-center">
        空白画纸 · 自由描绘你的照壁构想、纹样与故事
      </p>
    </div>
  );
});
