# 小茶 AI · 教学知识库

## 与课件知识库的关系

对话与画板 **共用** `data/store.json` → `pptKnowledge` 与 `data/ppt-knowledge/theory/`。

| 用途 | 模块 |
|------|------|
| PPT 幻灯片 | `src/lib/lessonPpt/knowledgeBase.ts` |
| 小茶对话 RAG | `src/lib/xiaochaAi/knowledgeBase.ts` |

API：`GET /api/ppt-knowledge`

## 对话检索原则

1. 拼接查询：`用户问题 + resolveLessonTopic()`
2. 对 `entries[].keywords` 做评分匹配（同 PPT skill）
3. 命中后从 `theoryContent` 提取 **≤3 条** 要点（每条约 40 字）
4. 注入 system prompt 的 `【知识库摘录】` 区块
5. 无命中 → 仅用通识回退，不阻塞回答

## 理论文件路径

```
data/ppt-knowledge/theory/
├── 大理白族民居建筑理论知识分类与数据库检索体系报告.md
└── 大理白族民居营造理论与空间艺术数据库.md   ← 营造与空间艺术主库（全文）
```

## 已入库条目（可对话引用）

| id | 对话场景 |
|----|----------|
| **`bai-building-art-database`** | **营造史、空间拓扑、照壁家风、工艺、微合院、非遗保护（全文）** |
| `bai-architecture-kb-report` | 建筑理论、数据库、空间战略 |
| `bai-spatial-layout` | 三坊一照壁、四合五天井、漏角天井 |
| `bai-craft-materials` | 营造工艺、材料、纸筋灰 |
| `bai-symbol-ethics` | 照壁题字、清白传家、德育 |
| `bai-folk-paint` | 彩绘入门、看纹样讲寓意 |
| `butterfly-motif` | 蝴蝶纹课堂、对称练习 |

## 冲突优先级

**数据库事实** > 模型臆造 > 通用回退
