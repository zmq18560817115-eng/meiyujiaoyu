import sharp from "sharp";
import { copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src =
  "/Users/zhangmingqi/.cursor/projects/Users-zhangmingqi-Desktop-untitled/assets/image-880ce57e-c185-481f-9c60-7312d4c04b4a.png";
const input = join(root, "src/assets/qingqiang-logo-source.png");
const out = join(root, "src/assets/qingqiang-logo-cutout.png");

copyFileSync(src, input);

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = info;

const sample = (x, y) => {
  const i = (y * w + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};

const corners = [
  sample(4, 4),
  sample(w - 5, 4),
  sample(4, h - 5),
  sample(w - 5, h - 5),
  sample(Math.floor(w / 2), 4),
];
const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / corners.length);
const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / corners.length);
const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / corners.length);

const dist = (r, g, b) => {
  const dr = r - bgR;
  const dg = g - bgG;
  const db = b - bgB;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const isBg = (r, g, b, a) => {
  if (a < 10) return true;
  if (dist(r, g, b) < 48) return true;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (lum > 200 && sat < 0.22) return true;
  return false;
};

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (isBg(data[i], data[i + 1], data[i + 2], data[i + 3])) data[i + 3] = 0;
  }
}

let buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toBuffer();

buf = await sharp(buf).trim({ threshold: 12 }).png().toBuffer();

// 2× 导出，界面缩放更清晰
buf = await sharp(buf)
  .resize({ width: Math.round(w * 2), height: Math.round(h * 2), kernel: "lanczos3" })
  .png({ compressionLevel: 6, quality: 100 })
  .toBuffer();

await sharp(buf).toFile(out);
copyFileSync(out, join(root, "public/qingqiang-logo-cutout.png"));
console.log("Logo cutout saved:", out);
