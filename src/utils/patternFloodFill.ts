/** 矢量化线稿边界判定：低于此亮度视为墨线 */
const LINE_LUMINANCE = 88;

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isLinePixel(r: number, g: number, b: number, a: number) {
  if (a < 40) return true;
  return luminance(r, g, b) < LINE_LUMINANCE;
}

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b, 255];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      255,
    ];
  }
  return [26, 54, 93, 255];
}

function colorClose(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  tolerance: number,
) {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

/** 线稿区域填色：点击空白处 flood fill，黑线作为边界 */
export function floodFillPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillHex: string,
  width: number,
  height: number,
) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= width || iy >= height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const start = (iy * width + ix) * 4;
  const sr = data[start];
  const sg = data[start + 1];
  const sb = data[start + 2];

  if (isLinePixel(sr, sg, sb, data[start + 3])) return;

  const [fr, fg, fb, fa] = hexToRgba(fillHex);
  if (colorClose(sr, sg, sb, fr, fg, fb, 8)) return;

  const tolerance = 28;
  const stack: [number, number][] = [[ix, iy]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [px, py] = stack.pop()!;
    const pi = py * width + px;
    if (visited[pi]) continue;
    visited[pi] = 1;

    const i = pi * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (isLinePixel(r, g, b, a)) continue;
    if (!colorClose(r, g, b, sr, sg, sb, tolerance)) continue;

    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = fa;

    if (px > 0) stack.push([px - 1, py]);
    if (px < width - 1) stack.push([px + 1, py]);
    if (py > 0) stack.push([px, py - 1]);
    if (py < height - 1) stack.push([px, py + 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}
