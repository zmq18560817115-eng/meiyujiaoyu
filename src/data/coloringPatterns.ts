export type ColoringPattern = {
  id: string;
  name: string;
  /** 位图回退 */
  imageUrl: string;
  /** 矢量化高清线稿（优先用于填色画板） */
  vectorUrl?: string;
  tags: string[];
};

function patternAsset(id: string): Pick<ColoringPattern, "imageUrl" | "vectorUrl"> {
  return {
    imageUrl: `/coloring-patterns/${id}.png`,
    vectorUrl: `/coloring-patterns/${id}.svg`,
  };
}

/** 学生填色纹样素材库 — 随机发放 */
export const COLORING_PATTERNS: ColoringPattern[] = [
  { id: "branch-flower", name: "枝头花卉", ...patternAsset("branch-flower"), tags: ["花卉", "植物"] },
  { id: "butterfly", name: "彩蝶纹", ...patternAsset("butterfly"), tags: ["蝴蝶", "纹样"] },
  { id: "simple-flower", name: "简笔花朵", ...patternAsset("simple-flower"), tags: ["花卉"] },
  { id: "round-medallion", name: "团花纹样", ...patternAsset("round-medallion"), tags: ["团花", "对称"] },
  { id: "corner-scroll", name: "角花卷草", ...patternAsset("corner-scroll"), tags: ["角花", "照壁"] },
  { id: "square-floral", name: "方胜花卉", ...patternAsset("square-floral"), tags: ["方胜", "对称"] },
  { id: "cloud-auspicious", name: "祥云纹", ...patternAsset("cloud-auspicious"), tags: ["云纹", "吉祥"] },
  { id: "cloud-wave", name: "水云纹", ...patternAsset("cloud-wave"), tags: ["云纹", "水纹"] },
  { id: "vase", name: "花瓶花卉", ...patternAsset("vase"), tags: ["器物", "花卉"] },
  { id: "knot-pendant", name: "结饰挂坠", ...patternAsset("knot-pendant"), tags: ["结饰", "民俗"] },
  { id: "deer", name: "瑞鹿图", ...patternAsset("deer"), tags: ["动物", "吉祥"] },
  { id: "boy-ethnic", name: "白族少年", ...patternAsset("boy-ethnic"), tags: ["人物", "民族"] },
  { id: "girl-ethnic", name: "白族姑娘", ...patternAsset("girl-ethnic"), tags: ["人物", "民族"] },
];

export function getPatternLineArtUrl(pattern: ColoringPattern): string {
  return pattern.vectorUrl ?? pattern.imageUrl;
}

export function pickRandomPattern(excludeId?: string): ColoringPattern {
  const pool = excludeId
    ? COLORING_PATTERNS.filter((p) => p.id !== excludeId)
    : COLORING_PATTERNS;
  return pool[Math.floor(Math.random() * pool.length)] ?? COLORING_PATTERNS[0];
}
