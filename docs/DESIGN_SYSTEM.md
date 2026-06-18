# 青墙粉绘 · 网页端通用设计规范

> 字体统一为 **苹方（PingFang SC）**。代码实现见 `src/design-system/tokens.css` 与 `src/index.css`。

## 1. 文字排版系统 (Typography)


| 样式名称           | 字号   | 字重            | 行高  | CSS 类名             | 应用场景      |
| -------------- | ---- | ------------- | --- | ------------------ | --------- |
| Display Large  | 24px | Bold (700)    | 1.4 | `.text-display-lg` | 核心页面主标题   |
| Display Medium | 20px | Medium (500)  | 1.4 | `.text-display-md` | 模块/区块标题   |
| Display Small  | 18px | Medium (500)  | 1.5 | `.text-display-sm` | 卡片/二级模块标题 |
| Body Text      | 16px | Regular (400) | 1.6 | `.text-body`       | 正文段落      |
| Secondary Text | 14px | Regular (400) | 1.5 | `.text-secondary`  | 辅助说明      |
| Caption Text   | 12px | Regular (400) | 1.5 | `.text-caption`    | 注脚/标签/微提示 |


## 2. 品牌配色 (Color Palette)

色值取自品牌色卡，实现于 `src/design-system/tokens.css`。


| 角色 | 色值 | CSS 变量 | Tailwind 类名 |
| ---- | ---- | -------- | ------------- |
| 主题绿 | `#28B06E` | `--color-theme-green` | `nupul-green` |
| 主题黄 | `#FFC526` | `--color-theme-yellow` | `nupul-yellow` |
| 强调橙 | `#FBA303` | `--color-accent-orange` | `nupul-orange` |
| 深棕（边框/正文） | `#3B2E0B` | `--color-accent-brown` | `nupul-dark` |
| 浅黄（柔和背景） | `#FFF0C8` | `--color-soft-yellow` | `nupul-soft-yellow` |
| 浅绿（柔和背景） | `#8BC48F` | `--color-soft-sage` | `nupul-soft-sage` |
| 墨黑 | `#000000` | `--color-ink-black` | `nupul-black` |
| 中性灰 | `#8C8C8C` | `--color-neutral-gray` | `nupul-gray` |


- 页面底色：`nupul-cream`（`#FFF9EE`）
- 深绿文字/激活态：`nupul-green-dark`（`#1A8F56`）
- 优先使用 `text-nupul-dark`、`bg-nupul-yellow` 等语义类，避免散落十六进制色值

## 3. 导航标签 (Nav Tabs)

- **选中态**：`font-bold`（加粗）+ 主题黄底 + 粗棕边框 + 硬阴影
- **未选中**：`font-normal`（常规字重）+ 白底浅边框
- **动效**：`transition-all duration-200`（切换时字重与底色同步过渡）
- 实现：`src/components/ui/NavTab.tsx`（顶栏主 Tab）、`SubPageNav`（三级/四级子 Tab）

## 4. 标签组件 (Tag Components)

### 分类标签 CategoryTag — 全圆角胶囊


| 变体       | 背景色       | 用途         |
| -------- | --------- | ---------- |
| `accent` | `#FFC526` | 学习/属性（主题黄）   |
| `brand`  | `#8BC48F` | 品牌/理想属性（浅绿） |


组件：`<CategoryTag variant="accent">三维漫游</CategoryTag>`

### 状态标签 StatusTag — 圆角 4px


| 变体        | 背景色       | 用途     |
| --------- | --------- | ------ |
| `warning` | `#FBA303` | 更新/待处理 |
| `success` | `#28B06E` | 完成/成功  |
| `danger`  | `#FBA303`（橙） | 未读/警示  |
| `neutral` | 灰底        | 中性状态   |


组件：`<StatusTag variant="warning">3 条未读</StatusTag>`

## 5. 排布与间距 (8px Grid)


| 层级   | 数值          | CSS 变量 / 类                                 |
| ---- | ----------- | ------------------------------------------ |
| 模块间距 | 48px / 64px | `--layout-module-gap`, `.gap-module`       |
| 组件间距 | 24px / 32px | `--layout-component-gap`, `.gap-component` |
| 内容间距 | 16px / 8px  | `--layout-content-gap`, `.gap-content`     |


- 页面容器：`.ds-page`（12 列栅格容器，max-width 1280px）
- 正文最大阅读宽度：`.ds-prose`（max-width 720px）

## 6. 设计原则

1. **一致性**：同层级使用同一文字样式与标签外观。
2. **可读性**：正文与背景对比度 ≥ 4.5:1（主色 `#3B2E0B` on `#FFF9EE`）。
3. **对比引导**：字重 + 状态色引导视线。

## 7. 与 Nupul 触觉风的关系

规范层（排版/标签/间距）与项目层（粗边框卡片 `.nupul-tactile-card`、偏移阴影按钮）叠加使用，不互相替代。

## 8. 2D 平面矢量插画规范

所有插画、线稿、装饰图形、画廊缩略图统一遵循：

| 要求 | 说明 |
| ---- | ---- |
| 细黑轮廓 | 闭合路径使用 `#000000` 描边，线宽 `1.5px`（`--stroke-width-illustration`） |
| 纯平涂填色 | 仅使用品牌色卡实色，禁止半透明叠色模拟渐变 |
| 禁止项 | 手绘笔触、噪点纹理、渐变阴影、立体透视、模糊光晕 |
| 几何精度 | SVG 使用 `shape-rendering="geometricPrecision"`，路径必须闭合 |

实现：`public/gallery/`、`public/coloring-patterns/`、`scripts/make-gallery-assets.mjs`、`scripts/vectorize-coloring-patterns.mjs`。UI 外角弥散光晕见 `.nupul-diffuse`（径向渐变 + 模糊，与插画规范分离）。

## 9. 代码约定（已全项目迁移）

- 禁止使用 `text-[9px]`、`text-xs`、`text-sm` 等零散字号；统一使用上表 CSS 类名。
- 禁止使用 `font-serif` / `font-sans`；字体由全局苹方继承，字重使用 `font-medium` / `font-semibold` / `font-bold`。
- 日期等需等宽对齐处可保留 `font-mono`（主题中已映射为苹方）。

