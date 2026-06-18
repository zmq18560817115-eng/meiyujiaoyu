import sharp from "sharp";
import { copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "src/assets/ip-mascot.png");
const out = join(root, "public/ip-mascot-cutout.png");

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

const isBgLike = (r, g, b, threshold = 36) => colorDist(r, g, b) < threshold;

const visited = new Uint8Array(w * h);
const queue = [];

const pushIfBg = (x, y) => {
  const idx = y * w + x;
  if (visited[idx]) return;
  const i = idx * 4;
  if (!isBgLike(data[i], data[i + 1], data[i + 2])) return;
  visited[idx] = 1;
  queue.push(idx);
};

for (let x = 0; x < w; x++) {
  pushIfBg(x, 0);
  pushIfBg(x, h - 1);
}
for (let y = 0; y < h; y++) {
  pushIfBg(0, y);
  pushIfBg(w - 1, y);
}

while (queue.length) {
  const idx = queue.pop();
  const x = idx % w;
  const y = (idx - x) / w;
  const i = idx * 4;
  data[i + 3] = 0;

  if (x > 0) pushIfBg(x - 1, y);
  if (x < w - 1) pushIfBg(x + 1, y);
  if (y > 0) pushIfBg(x, y - 1);
  if (y < h - 1) pushIfBg(x, y + 1);
}

let outBuf = await sharp(data, {
  raw: { width: w, height: h, channels: 4 },
})
  .png()
  .toBuffer();

outBuf = await sharp(outBuf).trim({ threshold: 10 }).png().toBuffer();

await sharp(outBuf).toFile(out);
copyFileSync(out, join(root, "src/assets/ip-mascot-cutout.png"));
console.log("Wrote transparent cutout:", out);
