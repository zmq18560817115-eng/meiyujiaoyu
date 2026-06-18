import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..", "src");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith(".tsx") || p.endsWith(".css")) files.push(p);
  }
  return files;
}

const patterns = [
  /\s*hover:shadow-\[[^\]]+\]/g,
  /\s*group-hover:shadow-\[[^\]]+\]/g,
  /\s*shadow-\[[^\]]+\]/g,
  /\s*active:shadow-none/g,
  /\s*hover:shadow-(xs|sm|md|lg)/g,
  /\s*group-hover:shadow-(xs|sm|md|lg)/g,
  /\s*shadow-(xs|sm|md|lg)/g,
];

let count = 0;
for (const file of walk(root)) {
  let text = readFileSync(file, "utf8");
  const before = text;
  for (const re of patterns) text = text.replace(re, "");
  if (text !== before) {
    writeFileSync(file, text);
    count++;
  }
}
console.log("Updated", count, "files");
