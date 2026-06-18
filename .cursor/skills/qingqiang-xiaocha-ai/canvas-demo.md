# 画板示范画 · 按授课专题生成线稿

## 触发时机

教师端 **智慧教学协同电子黑白板** → 点击右下角 **AI小助手**：

1. 展开浮层（已有）
2. 调用 `drawTopicDemoOnCanvas()` 在 canvas 上勾描本课示范

若 canvas 已有教师笔迹，**不清空**，在空白区域或半透明层叠加示范线（当前实现：直接叠加墨线，教师可用「归零重擦」）。

## 专题解析

`resolveLessonTopic(sources)` 优先级：

1. `lessonPresentCourse.title`
2. `aiGeneratedPlan.title`
3. `lessonTopic`（trim 后非空）
4. `"白族民居照壁彩绘"`

从 title 中去除前缀 `白族文化主题研学课 - ` 便于关键词匹配。

## Motif 映射

| 匹配关键词（任一） | motifId | 绘制内容 |
|------------------|---------|----------|
| 三坊, 照壁, 空间, 院落, 天井 | `courtyard-screen` | 上三下二 ∏ 形墙体 + 正中照壁 + 题字横批区 |
| 蝴蝶, 纹样, 卷云, 飞燕 | `butterfly-motif` | 左右对称蝶翼 + 中线虫身 + 触须 |
| 色彩, 石青, 蓝白, 颜料, 设色 | `color-bands` | 白墙大矩形 + 底部石青/朱红/蛤黄色带 |
| 工艺, 勾线, 墨线, 毛笔, 提顿 | `brush-stroke` | 3 条 S 形提顿示意线 + 箭头注释 |
| 清白, 传家, 德育, 榜书 | `ethics-screen` | 照壁框 + 「清白传家」占位格 + 朱红点缀 |
| （默认） | `default-screen` | 简照壁 + 底缘卷草纹 |

## 绘制规范

- 线宽：主轮廓 `2px`，装饰 `1.5px`
- 主色：烟墨 `#2c3e50`；点缀朱红 `#c53030`；色带用石青/蛤黄
- 占画布约 **70% 宽、60% 高**，居中略偏上
- 不填充大面积色块（保留勾描教学感）
- 绘制结束后浮层提示：「已根据本课「{shortTopic}」勾描示范线稿」

## 扩展新专题

用户上传理论后，若含新纹样/空间形制：

1. 在 `canvasDemo.ts` → `MOTIF_KEYWORDS` 增加关键词
2. 实现对应 `drawXxx(ctx, cx, cy, scale)` 函数
3. 在本表登记 motifId

## 与对话联动（可选增强）

示范画完成后，可向 `chatHistory` 追加一条 bot 消息：

> 徐老师，我已根据「{topic}」在画板勾出示范墨线。如需讲解要点，可问我：{推荐问题}

推荐问题从 `QUICK_QUESTION_TEMPLATES` 中按 motif 关键词选取 1 条。
