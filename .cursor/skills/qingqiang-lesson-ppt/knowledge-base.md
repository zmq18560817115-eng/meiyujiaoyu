# 知识库 · 理论文件与图片（数据库）

## 存储架构

样本素材存入项目 **JSON 数据库** `data/store.json` 的 `pptKnowledge` 字段，图片文件存于 `data/ppt-knowledge/assets/`。

```
data/
├── store.json                 # pptKnowledge 条目（理论正文、关键词、图片元数据）
└── ppt-knowledge/
    └── assets/                # 样本图片 / SVG / 后续上传文件
        └── placeholder-mural.svg
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ppt-knowledge` | 课件生成用 manifest（含 theoryContent） |
| GET | `/api/ppt-knowledge/entries` | 全部条目 |
| GET | `/api/ppt-knowledge/entries/:id` | 单条详情 |
| GET | `/api/ppt-knowledge/assets/:assetId` | 读取图片素材 |
| POST | `/api/ppt-knowledge/entries` | 教师新增条目（需登录） |

前端构建器：`src/lib/lessonPpt/knowledgeBase.ts` → `fetch('/api/ppt-knowledge')`

## 样本数据（已预置）

| id | 标题 | 关键词 |
|----|------|--------|
| `bai-building-art-database` | **大理白族民居营造理论与空间艺术数据库（全文）** | 营造、空间拓扑、照壁、彩绘、微合院、非遗 |
| `bai-architecture-kb-report` | **建筑理论知识分类与数据库检索体系报告（全文）** | 白族、建筑、理论、数据库、检索 |
| `bai-spatial-layout` | 空间布局体系 | 三坊一照壁、四合五天井、漏角天井 |
| `bai-craft-materials` | 营造工艺与材料 | 纸筋灰、海东青山石、六合门 |
| `bai-symbol-ethics` | 符号学与伦理 | 照壁题字、山花、湿壁画法 |
| `bai-modern-courtyard` | 现代向内微合院 | 当代转译、取景 |
| `bai-metadata-glossary` | 数据库属性词表 | 元数据、喜洲严家大院 |
| `bai-folk-paint` | 白族民居彩绘概要 | 彩绘、照壁 |
| `butterfly-motif` | 蝴蝶纹与飞燕纹 | 蝴蝶、纹样 |

全文 Markdown：

- `data/ppt-knowledge/theory/大理白族民居营造理论与空间艺术数据库.md`
- `data/ppt-knowledge/theory/大理白族民居建筑理论知识分类与数据库检索体系报告.md`

## 上传新资料

**方式 A — API（推荐）**

```bash
curl -X POST http://localhost:3000/api/ppt-knowledge/entries \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"新理论","keywords":["扎染","植物"],"theoryContent":"- 要点一\n- 要点二"}'
```

图片文件手动放入 `data/ppt-knowledge/assets/`，并在 `store.json` 对应 entry 的 `images` 中登记 `assetId`。

**方式 B — 直接编辑 store.json**

在 `pptKnowledge.entries` 追加条目，重启服务后生效。

## Agent 融合原则

- 理论全文 **不整页粘贴**；提炼 3–4 条 bullets
- 图片一页最多 1 张主图
- 无匹配条目时回退 AI plan，不阻塞生成
- 冲突时：**数据库事实** > AI 臆造

## 与 Skill 协作

用户说「用新上传的理论优化 PPT」时：

1. `GET /api/ppt-knowledge` 匹配 keywords
2. 使用返回的 `theoryContent` 与 `images[].path`
3. 按 SKILL.md 分页结构生成 `LessonSlide[]`

静态回退：`public/ppt-knowledge/manifest.json`（API 不可用时）
