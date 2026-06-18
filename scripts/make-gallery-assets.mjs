/**
 * 恢复/同步画廊预置画作（真实学生作品示意 PNG，勿用程序化 SVG 覆盖）。
 *
 * 用法: node scripts/make-gallery-assets.mjs
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/gallery");
const sourcesDir = join(outDir, "_sources");

const SOURCES = [
  { id: "sw-1-peony", file: "sw-1-peony.png" },
  { id: "sw-2-butterfly", file: "sw-2-butterfly.png" },
  { id: "sw-3-pomegranate", file: "sw-3-pomegranate.png" },
  { id: "sw-4-orchid", file: "sw-4-orchid.png" },
];

mkdirSync(outDir, { recursive: true });

for (const { id, file } of SOURCES) {
  const src = join(sourcesDir, file);
  const dest = join(outDir, `${id}.png`);
  if (!existsSync(src)) {
    console.warn("Skip (missing source):", src);
    continue;
  }
  copyFileSync(src, dest);
  console.log("Restored", dest);
}
