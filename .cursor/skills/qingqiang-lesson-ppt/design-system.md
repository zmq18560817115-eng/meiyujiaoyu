# 青墙粉绘课件 · 设计规范

与 `src/lib/lessonPpt/manifest.ts`、`src/design-system/tokens.css` 保持一致。

## 配色

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--color-theme-green` | `#28b06e` | 强调、进度点、环节标签 |
| `--color-theme-yellow` | `#ffc526` | 封面点缀、授课贴士底 |
| `--color-accent-brown` | `#3b2e0b` | 边框、页眉页脚、标题 |
| `--color-surface-tint-yellow` | `#fff9ee` | 幻灯片主背景 |
| `--color-surface-tint-green` | `#e8f5ea` | 次要信息底 |
| 幕布背景 | `#3a2e0b` | overlay 外层 |

**禁止**：纯红大面积底、霓虹色、系统默认蓝链接色。

## 字体

- 全系：**PingFang SC**（`--font-family-base`）
- 封面标题：`text-display-lg` / 24px bold
- 页标题：`text-display-md` / 20px bold
- 正文：`text-secondary` / 14px semibold
- 脚注/标签：`text-caption` / 12px

## 版式（layout）

### `cover` — 课件封面

- 垂直居中，大标题 + 副标题
- 右下角 footnote（难度 · 时长）
- 可选装饰：淡色纹样条（CSS `lesson-ppt-cover-accent`）

### `section` — 环节页

- 上：CategoryTag + 环节名
- 中：bullets 或短段落
- 下：授课贴士黄底框（`lesson-ppt-tip`）

### `image-split` — 图文页

- 左 40% 图片（圆角 + 棕边框）
- 右 60% 标题 + bullets
- 知识库图片优先填入 `imageUrl`

### `content` — 列表页

- 标题 + `·` 列表 bullets

### `closing` — 结语

- 居中感谢语 + 一行行动指引

## 分页与交互

- 宽高比：16:9 语义（`lesson-ppt-slide` max-width 56rem）
- 页码：顶栏 `n / total`
- 键盘：← → 翻页，Esc 退出
- 底栏：上一页 / 圆点 / 下一页

## Marp 导出模板（备选）

```markdown
---
marp: true
theme: default
paginate: true
style: |
  section { background: #fff9ee; color: #3b2e0b; font-family: 'PingFang SC', sans-serif; }
  h1 { color: #28b06e; }
  strong { color: #3b2e0b; }
---

# {{title}}
{{subtitle}}

---

## {{sectionTitle}}
{{bullets}}

> **授课贴士**：{{tip}}
```

将 `{{...}}` 替换为 `LessonSlide` 字段后保存为 `public/ppt-knowledge/exports/lesson.md`。
