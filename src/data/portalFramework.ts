/**
 * 彩绘美育 · 双端目录框架（信息架构文案）
 * 与产品设计脑图对齐，供导航与子页标签复用。
 */

/** 教师端 · 首页快捷入口 */
export const TEACHER_HOME_ENTRIES = [
  {
    id: "schedule",
    label: "今日课程",
    desc: "查看课表与授课安排",
    tab: "home" as const,
  },
  {
    id: "story-lesson",
    label: "照壁故事课入口",
    desc: "10 个故事课城包",
    tab: "lessons" as const,
  },
  {
    id: "progress",
    label: "授课进度",
    desc: "班级完成率与覆盖",
    tab: "home" as const,
  },
  {
    id: "works-alert",
    label: "学生作品提醒",
    desc: "待批阅与推报",
    tab: "works" as const,
  },
] as const;

/** @deprecated 仅用于课件生成模板，不在界面展示 */
export const STORY_LESSON_TEMPLATE_SECTIONS = [
  "教学目标",
  "课堂流程",
  "AI主讲稿",
  "互动提问",
  "绘画任务",
  "评价标准",
] as const;

/** 教师端 · 课程分类（纹样/色彩/工艺 + 照壁故事课） */
export const TEACHER_LESSON_CATEGORIES = [
  { id: "base", label: "照壁故事课" },
  { id: "motif", label: "纹样课" },
  { id: "color", label: "色彩课" },
  { id: "craft", label: "工艺课" },
] as const;

/** 教师端 · 3D鉴赏子模块 */
export const TEACHER_3D_MODULES = [
  "喜洲民居",
  "三坊一照壁",
  "照壁故事地图",
] as const;

/** 教师端 · 智慧白板 / 作品批改共用能力标签 */
export const TEACHER_REVIEW_CAPABILITIES = [
  "AI一键点评",
  "文化维度评价",
  "优化建议",
  "优秀作品推荐",
] as const;

/** 教师端 · 作品展示子模块 */
export const TEACHER_DISPLAY_MODULES = [
  "班级照壁展",
  "优秀周报",
  "学生故事卡",
] as const;

/** 学生端 · 3D鉴赏子模块 */
export const STUDENT_3D_MODULES = [
  { id: "map", label: "照壁故事地图", icon: "cube" as const },
  { id: "zoom", label: "放大/拆解", icon: "pattern" as const },
  { id: "ai", label: "AI简短讲解", icon: "messages" as const },
];

/** 学生端 · 作品展示子模块 */
export const STUDENT_GALLERY_MODULES = [
  { id: "hall", label: "班级照壁展", icon: "palette" as const },
  { id: "mine", label: "我的故事卡", icon: "brush" as const },
  { id: "upload", label: "上传作品", icon: "share" as const },
] as const;
