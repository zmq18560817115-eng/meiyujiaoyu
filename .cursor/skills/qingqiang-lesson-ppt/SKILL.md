---
name: qingqiang-lesson-ppt
description: >-
  Generates beautified lesson PPT slides for 青墙粉绘 teacher portal: layout,
 配色, typography, pagination, HTML overlay export, and knowledge-base fusion.
  Use when building or improving 一键生成PPT, LessonPptOverlay, AI微课备课课件,
  lesson slides, Marp export, or when merging uploaded theory/images into slides.
disable-model-invocation: false
---

# 青墙粉绘 · 美育课件 PPT Skill

## 何时使用

- 用户点击 **一键生成 PPT / 使用本篇教案上课 / 确认使用** 后需要产出或优化课件
- 需要把上传的 **理论文件、图片** 融入幻灯片
- 需要调整课件 **版式、配色、字体、分页结构**
- 需要导出 **HTML 全屏课件**（默认）或 **Marp Markdown**（备选）

## 系统接入点（必读）

| 环节 | 路径 |
|------|------|
| 幻灯片数据模型 | `src/lib/lessonPpt/types.ts` → `LessonSlide` |
| 设计规范（代码真源） | `src/lib/lessonPpt/manifest.ts` |
| 构建器 | `src/lib/lessonPpt/buildSlides.ts` |
| 知识库数据库 | `data/store.json` → `pptKnowledge` + `data/ppt-knowledge/assets/` |
| 知识库 API | `GET /api/ppt-knowledge` · `src/lib/lessonPpt/knowledgeBase.ts` |
| 全屏渲染 | `src/components/teacher/LessonPptOverlay.tsx` |
| 一键生成入口 | `TeacherPortal.tsx` → `openLessonPpt` / `buildLessonSlidesFromAiPlan` |

**规则**：改视觉规范时同步更新 `manifest.ts` 与本 skill 的 [design-system.md](design-system.md)。

## 工作流

```
Task Progress:
- [ ] 1. 读取教案/AI plan（title, parts, suggestions）
- [ ] 2. 加载知识库 manifest + 匹配 theory/images
- [ ] 3. 按分页结构生成 LessonSlide[]
- [ ] 4. 校验每页字数与 layout
- [ ] 5. 接入 LessonPptOverlay 或导出
```

### Step 1 — 输入

- **AI 定制教案**：`AiGeneratedPlan`（`title`, `subtitle`, `parts[]`, `suggestions[]`）
- **已有课程卡片**：`Course`（`outline`, `materials`）
- **知识库**：`data/store.json` 中 `pptKnowledge` 条目（理论正文 + 图片元数据）

### Step 2 — 知识融合

1. 请求 `GET /api/ppt-knowledge`（回退 `public/ppt-knowledge/manifest.json`）
2. 用 `keywords` 将课题与 theoryContent、图片 asset 匹配
3. 理论摘录 **压缩为要点**（每页 body ≤ 120 字，bullets ≤ 4 条）
4. 图片优先用于 `image-split` 版式（见 design-system）

详见 [knowledge-base.md](knowledge-base.md)。

### Step 3 — 分页结构（固定顺序）

| 序号 | layout | tag | 内容 |
|------|--------|-----|------|
| 1 | `cover` | 课件封面 | title + subtitle + footnote |
| 2…n | `section` 或 `image-split` | 第N环节 | part.name + desc + tip |
| n+1 | `content` | 拓展研学 | suggestions 列表 |
| 末页 | `closing` | 课堂结语 | 固定结语 + 画廊上传提示 |

**授课贴士** 不得与正文混排在同一段：写入 `tip` 字段，由 UI 渲染为黄色提示框。

### Step 4 — 输出格式

**默认：HTML 全屏幻灯片（React）**

- 使用 `buildBeautifiedSlidesFromAiPlan` / `buildBeautifiedSlidesFromCourse`
- 由 `LessonPptOverlay` 渲染，CSS 类名前缀 `lesson-ppt-`

**备选：Marp Markdown 导出**

- 按 [design-system.md](design-system.md) 末尾 Marp 模板生成 `.md`
- 用户本地 `marp slides.md -o slides.pdf` 导出 PDF

**不默认使用 python-pptx**（教室端以浏览器全屏为主；若用户明确要求 Office 文件再单独处理）。

### Step 5 — 质量检查

- [ ] 封面 title 不超过 2 行
- [ ] 每页正文不超过 4 条 bullet 或 120 汉字
- [ ] `tip` 单独存在，未塞进 `body`
- [ ] 含图页使用 `image-split`，图片有 `imageCaption`
- [ ] 页数 = 封面 + parts + (suggestions?1:0) + 结语
- [ ] 配色仅使用 design-system 令牌，不引入新色

## 调用示例

**在代码中（一键生成）：**

```ts
import { buildBeautifiedSlidesFromAiPlan } from "../../lib/lessonPpt";

const slides = await buildBeautifiedSlidesFromAiPlan(aiGeneratedPlan);
openLessonPpt(courseFromAiPlan(aiGeneratedPlan), slides);
```

**在对话中（Agent 改课件）：**

> 使用 qingqiang-lesson-ppt skill，根据 `public/ppt-knowledge/theory/白族彩绘.md` 优化「蝴蝶纹」教案课件，增加 image-split 页。

## 附加资源

- 版式与配色：[design-system.md](design-system.md)
- 知识库维护：[knowledge-base.md](knowledge-base.md)
