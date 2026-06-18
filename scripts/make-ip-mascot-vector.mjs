import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "public/ip-mascot-cutout.png");
const hdPng = join(root, "public/ip-mascot-cutout-hd.png");
const hdPngRight = join(root, "public/ip-mascot-cutout-hd-right.png");
const svgOut = join(root, "public/ip-mascot-runner.svg");
const svgSrc = join(root, "src/assets/ip-mascot-runner.svg");

const meta = await sharp(input).metadata();
const viewW = meta.width ?? 275;
const viewH = meta.height ?? 572;
const scale = 6;

const hdBuffer = await sharp(input)
  .resize(viewW * scale, viewH * scale, { kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(hdBuffer).toFile(hdPng);
await sharp(hdBuffer).flop().toFile(hdPngRight);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="${viewW}" height="${viewH}">
  <image
    href="/ip-mascot-cutout-hd-right.png"
    width="${viewW}"
    height="${viewH}"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>`;

writeFileSync(svgOut, svg);
writeFileSync(svgSrc, svg);
console.log("Wrote 6x HD PNG:", hdPng);
console.log("Wrote 6x HD PNG (face right):", hdPngRight);
console.log("Wrote vector SVG:", svgOut);
