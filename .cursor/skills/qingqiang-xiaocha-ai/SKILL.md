---
name: qingqiang-xiaocha-ai
description: >-
  Defines 小茶 AI dialogue logic for 青墙粉绘 teacher portal: persona, RAG
  knowledge fusion, Q&A response format, quick templates, and whiteboard demo
  painting by lesson topic. Use when building or improving 洱海苍山非遗大模型教学智库,
  /api/chat, 画板 AI小助手, XiaochaMascotPanel, canvas demo strokes, or uploading
  theory into the teaching knowledge base.
disable-model-invocation: false
---

# 青墙粉绘 · 小茶 AI 对话 Skill

## 何时使用

- 实现或优化 **小茶 AI** 教师端对话（智慧问答页 + 画板浮层小助手）
- 实现或优化 **小草** 学生端对话伴读与 **对话素材库**（复用 pptKnowledge RAG）
- 用户将上传 **理论文本**，需融入对话检索与回答
- 画板 **AI小助手** 点击后需按 **本节课授课专题** 生成示范勾描
- 调整快捷提问模版、人设语气、离线回退、知识来源标注

## 系统接入点（必读）

| 环节 | 路径 |
|------|------|
| 对话 API | `server/routes/ai.ts` → `POST /api/chat` |
| 人设与系统提示 | `src/lib/xiaochaAi/persona.ts` |
| 知识库匹配 | `src/lib/xiaochaAi/knowledgeBase.ts`（复用 `pptKnowledge`） |
| 回答构建 | `src/lib/xiaochaAi/buildReply.ts` |
| 画板示范画 | `src/lib/xiaochaAi/canvasDemo.ts` |
| 教师端入口 | `TeacherPortal.tsx` → `handleSendQAndA` / 画板 `AI小助手` |
| 学生端入口 | `StudentDialoguePanel.tsx` → `伴读：对话素材库` |
| 学生素材库 | `src/lib/xiaochaAi/studentMaterialLibrary.ts` |
| 学生人设 | `persona.ts` → `XIAOCAO_GREETING` · `buildStudentSystemInstruction` |
| 数字人组件 | `XiaochaMascotPanel.tsx` · `XiaochaDigitalHuman.tsx` |

**规则**：理论入库后同步更新 [knowledge-base.md](knowledge-base.md)；画板线稿规则见 [canvas-demo.md](canvas-demo.md)。

## 双通道架构

```
                    ┌─────────────────────┐
  授课专题 topic ──►│ resolveLessonTopic  │
                    └─────────┬───────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    智慧问答 /api/chat   画板示范画 canvas    快捷模版
    buildReply()         drawTopicDemo()      persona templates
```

## 工作流 A — 对话回答

```
Task Progress:
- [ ] 1. 解析用户问题 + 最近 4 轮 history
- [ ] 2. 加载知识库，按 keywords 匹配 theory 摘录
- [ ] 3. 组装 systemInstruction（小茶人设 + 本课专题 + 摘录）
- [ ] 4. 生成回答（≤150 字，实操向，小学段）
- [ ] 5. 标注 source；离线时走 buildOfflineReply
```

### 回答格式

- **称呼**：徐老师（教师端）
- **语气**：温暖、实操、非遗美育专业，避免学术堆砌
- **结构**：先给 1 句结论 → 1–2 条课堂做法 → 可选 1 条德育/文化点
- **长度**：正文 ≤ 150 汉字
- **来源**：`知识来源: 洱海苍山非遗教学智库` 或 `本地智库离线算法`

详见 [persona.md](persona.md)。

## 工作流 B — 画板示范画

**触发**：教师点击画板右下角 **AI小助手**（首次展开或再次点击「生成本课示范」）

**输入**：`resolveLessonTopic()` 优先级：

1. `lessonPresentCourse.title`（正在上课的课件）
2. `aiGeneratedPlan.title`（已生成未上课案）
3. `lessonTopic`（备课输入框）
4. 回退：`白族民居照壁彩绘`

**输出**：在 `canvas` 上绘制 **墨线示范勾描**（不覆盖教师已画内容；绘制前可选轻提示）

| 专题关键词 | 示范 motif | 主色 |
|-----------|-----------|------|
| 三坊 / 照壁 / 空间布局 | ∏形院落 + 照壁矩形 + 题字区 | 烟墨 `#2c3e50` |
| 蝴蝶 / 纹样 / 卷云 | 对称蝴蝶或如意云头轮廓 | 石青 `#1a365d` |
| 色彩 / 石青 / 蓝白 | 色带条 + 白墙框 | 石青 + 蛤白 |
| 工艺 / 勾线 / 墨线 | 提顿用笔示意曲线 | 烟墨 |
| 清白 / 德育 / 传家 | 照壁榜书框 + 简短竖线装饰 | 烟墨 + 朱红点缀 |
| 默认 | 简照壁 + 底纹卷草 | 烟墨 |

步骤详见 [canvas-demo.md](canvas-demo.md)。代码真源：`drawTopicDemoOnCanvas()`。

## 工作流 C — 理论文本入库（用户稍后提供）

1. 将 Markdown 放入 `data/ppt-knowledge/theory/`
2. 在 `server/lib/pptKnowledge.ts` 或 `POST /api/ppt-knowledge/entries` 登记
3. 填写 `keywords` 便于 `matchKnowledgeForChat()` 命中
4. 对话时摘录 **≤3 条要点** 注入 prompt，禁止整篇粘贴

详见 [knowledge-base.md](knowledge-base.md)。

## 质量检查

- [ ] 回答紧扣问题，未跑题为通用百科
- [ ] 含本课专题时回答显式关联专题名
- [ ] 画板示范与专题 motif 一致
- [ ] 快捷模版与人设一致，无学生端「小草」口吻混入教师端
- [ ] 离线回退仍能给出可上课建议

## 调用示例

**Agent 改对话逻辑：**

> 使用 qingqiang-xiaocha-ai skill，把新上传的照壁理论融入小茶回答，并增加「漏角天井」专题画板线稿。

**代码中（画板点击）：**

```ts
import { resolveLessonTopic, drawTopicDemoOnCanvas } from "../../lib/xiaochaAi";

const topic = resolveLessonTopic({ lessonPresentCourse, aiGeneratedPlan, lessonTopic });
drawTopicDemoOnCanvas(ctx, topic, width, height);
```

## 附加资源

- 人设与模版：[persona.md](persona.md)
- 知识库：[knowledge-base.md](knowledge-base.md)
- 画板示范：[canvas-demo.md](canvas-demo.md)
