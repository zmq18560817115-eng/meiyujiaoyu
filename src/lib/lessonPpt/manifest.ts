/**
 * 课件视觉规范真源 — 与 .cursor/skills/qingqiang-lesson-ppt/design-system.md 同步
 */
export const LESSON_PPT_DESIGN = {
  colors: {
    green: "#28b06e",
    yellow: "#ffc526",
    brown: "#3b2e0b",
    cream: "#fff9ee",
    softGreen: "#e8f5ea",
    stage: "#3a2e0b",
  },
  fonts: {
    base: '"PingFang SC", "PingFang TC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  slideSequence: ["cover", "section", "content", "closing"] as const,
  limits: {
    titleLines: 2,
    bodyChars: 120,
    maxBullets: 4,
  },
  closing: {
    title: "谢谢孩子们参与",
    body: "下课前可邀请学生用一句话写出今天的彩绘收获，并在数字画廊上传作品。",
  },
} as const;

export const KNOWLEDGE_BASE_URL = "/api/ppt-knowledge";
