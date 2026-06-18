/**
 * 将填色线稿 PNG 预处理为高清二值图并矢量化 SVG，便于画板清晰渲染与填色。
 *
 * 用法: node scripts/vectorize-coloring-patterns.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import potrace from "potrace";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INPUT_DIR = path.join(ROOT, "public/coloring-patterns");
const TMP_DIR = path.join(ROOT, "public/coloring-patterns/.processed");
const TARGET_LONG_EDGE = 1600;
const THRESHOLD = 168;

async function preprocessToBitmap(inputPath, tmpPath) {
  const meta = await sharp(inputPath).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const scale = Math.max(1, TARGET_LONG_EDGE / longEdge);

  await sharp(inputPath)
    .resize({
      width: Math.round((meta.width ?? 0) * scale),
      height: Math.round((meta.height ?? 0) * scale),
      kernel: sharp.kernel.lanczos3,
    })
    .flatten({ background: "#ffffff" })
    .greyscale()
    .normalize()
    .linear(1.35, -28)
    .threshold(THRESHOLD)
    .png({ compressionLevel: 9 })
    .toFile(tmpPath);

  return tmpPath;
}

function traceToSvg(bitmapPath, svgPath) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      bitmapPath,
      {
        color: "#000000",
        background: "#ffffff",
        turdSize: 2,
        optTolerance: 0.2,
        turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
        threshold: 128,
      },
      (err, svg) => {
        if (err) {
          reject(err);
          return;
        }
        const normalized = svg
          .replace(/#1a1a1a/g, "#000000")
          .replace(
            /<svg /,
            '<svg shape-rendering="geometricPrecision" ',
          );
        fs.writeFileSync(svgPath, normalized, "utf8");
        resolve(svgPath);
      },
    );
  });
}

async function writeHiResPng(bitmapPath, pngPath) {
  await sharp(bitmapPath)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(pngPath);
}

async function main() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => f.endsWith(".png") && !f.startsWith("."));

  console.log(`处理 ${files.length} 张纹样线稿…`);

  for (const file of files) {
    const base = file.replace(/\.png$/i, "");
    const inputPath = path.join(INPUT_DIR, file);
    const tmpPath = path.join(TMP_DIR, `${base}.bmp.png`);
    const svgPath = path.join(INPUT_DIR, `${base}.svg`);
    const hqPngPath = path.join(INPUT_DIR, `${base}-hq.png`);

    try {
      await preprocessToBitmap(inputPath, tmpPath);
      await traceToSvg(tmpPath, svgPath);
      await writeHiResPng(tmpPath, hqPngPath);

      const svgMeta = fs.statSync(svgPath);
      console.log(`✓ ${base} → ${base}.svg (${(svgMeta.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`✗ ${base}:`, e.message || e);
    }
  }

  console.log("完成。画板将优先加载 .svg 矢量线稿。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
