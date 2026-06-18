import sharp from "sharp";
import { copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "src/assets/xiaocha-character.png");
const out = join(root, "src/assets/xiaocha-character-cutout.png");

const meta = await sharp(input).metadata();
const frameW = Math.floor(meta.width / 3);

const { data, info } = await sharp(input)
  .extract({ left: 0, top: 0, width: frameW, height: meta.height })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = info;

const sample = (x, y) => {
  const i = (y * w + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};

const corners = [
  sample(2, 2),
  sample(w - 3, 2),
  sample(2, h - 3),
  sample(w - 3, h - 3),
];
const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);

const colorDist = (r, g, b) => {
  const dr = r - bgR;
  const dg = g - bgG;
  const db = b - bgB;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const isBg = (r, g, b) => {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (colorDist(r, g, b) < 42) return true;
  if (lum > 210 && sat < 0.18) return true;
  if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25)
    return true;
  return false;
};

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBg(r, g, b)) data[i + 3] = 0;
  }
}

let outBuf = await sharp(data, {
  raw: { width: w, height: h, channels: 4 },
})
  .png()
  .toBuffer();

outBuf = await sharp(outBuf).trim({ threshold: 10 }).png().toBuffer();

await sharp(outBuf).toFile(out);
copyFileSync(out, join(root, "public/xiaocha-character-cutout.png"));
console.log("Wrote transparent cutout:", out);
