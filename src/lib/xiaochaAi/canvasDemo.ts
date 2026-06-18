import type { LessonTopicSources, MotifId } from "./types";

const INK = "#2c3e50";
const RED = "#c53030";
const INDIGO = "#1a365d";
const YELLOW = "#e6bf47";

const MOTIF_KEYWORDS: Array<{ keywords: string[]; motif: MotifId }> = [
  { keywords: ["三坊", "照壁", "空间", "院落", "天井", "布局"], motif: "courtyard-screen" },
  { keywords: ["蝴蝶", "纹样", "卷云", "飞燕"], motif: "butterfly-motif" },
  { keywords: ["色彩", "石青", "蓝白", "颜料", "设色"], motif: "color-bands" },
  { keywords: ["工艺", "勾线", "墨线", "毛笔", "提顿"], motif: "brush-stroke" },
  { keywords: ["清白", "传家", "德育", "榜书"], motif: "ethics-screen" },
];

export function resolveLessonTopic(sources: LessonTopicSources): string {
  const raw =
    sources.lessonPresentCourseTitle?.trim() ||
    sources.aiGeneratedPlanTitle?.trim() ||
    sources.lessonTopic?.trim() ||
    "白族民居照壁彩绘";
  return raw;
}

export function shortLessonTopic(topic: string): string {
  return topic.replace(/^白族文化主题研学课\s*[-–—]\s*/, "").trim();
}

export function resolveMotifId(topic: string): MotifId {
  const t = topic.toLowerCase();
  for (const row of MOTIF_KEYWORDS) {
    if (row.keywords.some((k) => t.includes(k.toLowerCase()))) {
      return row.motif;
    }
  }
  return "default-screen";
}

function drawCourtyardScreen(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  const w = 120 * scale;
  const h = 80 * scale;
  // ∏ 形院落
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h * 0.55);
  ctx.strokeRect(cx - w / 2, cy - h / 2, w * 0.28, h);
  ctx.strokeRect(cx + w / 2 - w * 0.28, cy - h / 2, w * 0.28, h);
  // 照壁
  ctx.strokeRect(cx - w * 0.18, cy + h * 0.05, w * 0.36, h * 0.42);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - w * 0.12, cy + h * 0.12, w * 0.24, h * 0.1);
}

function drawButterflyMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  ctx.strokeStyle = INDIGO;
  ctx.lineWidth = 2;
  const s = 50 * scale;
  ctx.beginPath();
  ctx.ellipse(cx - s * 0.45, cy - s * 0.1, s * 0.42, s * 0.55, -0.3, 0, Math.PI * 2);
  ctx.ellipse(cx + s * 0.45, cy - s * 0.1, s * 0.42, s * 0.55, 0.3, 0, Math.PI * 2);
  ctx.ellipse(cx - s * 0.35, cy + s * 0.35, s * 0.3, s * 0.38, 0.2, 0, Math.PI * 2);
  ctx.ellipse(cx + s * 0.35, cy + s * 0.35, s * 0.3, s * 0.38, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.5);
  ctx.lineTo(cx, cy + s * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.45);
  ctx.lineTo(cx - s * 0.15, cy - s * 0.65);
  ctx.moveTo(cx, cy - s * 0.45);
  ctx.lineTo(cx + s * 0.15, cy - s * 0.65);
  ctx.stroke();
}

function drawColorBands(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  const w = 140 * scale;
  const h = 90 * scale;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h * 0.65);
  const bands = [INDIGO, RED, YELLOW];
  const bh = (h * 0.35) / bands.length;
  bands.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(cx - w / 2, cy + h * 0.15 + i * bh, w, bh);
  });
  ctx.globalAlpha = 1;
  ctx.strokeRect(cx - w / 2, cy + h * 0.15, w, h * 0.35);
}

function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  const s = 60 * scale;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s * 0.4 + i * s * 0.35);
    ctx.bezierCurveTo(
      cx - s * 0.3,
      cy - s * 0.7 + i * s * 0.35,
      cx + s * 0.3,
      cy + s * 0.2 + i * s * 0.35,
      cx + s,
      cy + i * s * 0.35,
    );
    ctx.stroke();
  }
}

function drawEthicsScreen(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  const w = 100 * scale;
  const h = 70 * scale;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.strokeRect(cx - w * 0.35, cy - h * 0.15, w * 0.7, h * 0.22);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.4, cy + h * 0.25);
  ctx.lineTo(cx + w * 0.4, cy + h * 0.25);
  ctx.stroke();
}

function drawDefaultScreen(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  drawCourtyardScreen(ctx, cx, cy, scale * 0.85);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  const w = 100 * scale;
  ctx.beginPath();
  for (let x = -w * 0.4; x <= w * 0.4; x += 12 * scale) {
    ctx.moveTo(cx + x, cy + 45 * scale);
    ctx.quadraticCurveTo(cx + x + 6 * scale, cy + 38 * scale, cx + x + 12 * scale, cy + 45 * scale);
  }
  ctx.stroke();
}

const DRAWERS: Record<
  MotifId,
  (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => void
> = {
  "courtyard-screen": drawCourtyardScreen,
  "butterfly-motif": drawButterflyMotif,
  "color-bands": drawColorBands,
  "brush-stroke": drawBrushStroke,
  "ethics-screen": drawEthicsScreen,
  "default-screen": drawDefaultScreen,
};

/** 按授课专题在画板勾描示范墨线 */
export function drawTopicDemoOnCanvas(
  ctx: CanvasRenderingContext2D,
  topic: string,
  width: number,
  height: number,
): MotifId {
  const motif = resolveMotifId(topic);
  const scale = Math.min(width, height) / 650;
  const cx = width * 0.5;
  const cy = height * 0.42;
  ctx.save();
  ctx.globalAlpha = 0.88;
  DRAWERS[motif](ctx, cx, cy, scale);
  ctx.restore();
  return motif;
}
