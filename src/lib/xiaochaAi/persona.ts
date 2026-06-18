/** 小茶 AI 人设与快捷模版 — 真源见 .cursor/skills/qingqiang-xiaocha-ai/persona.md */

export const XIAOCHA_GREETING =
  "您好，徐老师！我是非遗大理民居彩绘教学智慧助教「小茶 AI」。请问您在今天的课程设计、教案规划或者文化常识讲解上，有什么需要解答的吗？您可以直接键入您的教学难点，或者点击左侧的非遗常备智库快捷提问模版一键咨询。";

export const XIAOCAO_GREETING =
  "你好呀！我是大理非遗童谣精灵「小草」！我会用温暖的话解答白族建筑彩绘里的小奥秘，也会唱几句白语祝福。点击左侧对话素材库里的趣味话题，或者直接问我吧！";

/** 学生端对话伴读默认快捷问（与素材库互补） */
export const STUDENT_QUICK_QUESTIONS = [
  "白语里「大吉大利」怎么说呀？",
  "为什么白族人偏爱大理蓝白搭配？",
  "喜洲彩绘最常用的传统题材有哪些？",
  "照壁里写着「清白传家」是什么故事？",
] as const;

export const QUICK_QUESTION_TEMPLATES = [
  "零基础的小学生怎么去开展墨线起初勾墨？",
  "如何形象地向孩子们表达「清白传家」的精神图腾？",
  "白族彩绘中的「大理蓝白搭配」提炼自哪些大自然材料？",
  "大理白语中关于祝福有哪几个代表性的传统词语？",
  "怎么给孩子们传授「白白墙上挂重蓝」的天然提炼理念？",
] as const;

export const WHITEBOARD_QUICK_TEMPLATES = QUICK_QUESTION_TEMPLATES.slice(0, 2);

export function buildTeacherSystemInstruction(
  lessonTopic: string,
  knowledgeExcerpt: string[] = [],
): string {
  const excerptBlock =
    knowledgeExcerpt.length > 0
      ? `\n【知识库摘录】\n${knowledgeExcerpt.map((l) => `- ${l}`).join("\n")}`
      : "";

  return (
    "你是「小茶」，大理白族民居彩绘美育系统的教师智慧助教。" +
    "用温暖、实操的中文回答小学美术教师，正文不超过150字。" +
    `优先结合本课专题「${lessonTopic}」给课堂建议。` +
    "结构：先给结论，再给1–2条课堂做法，可选1条文化或德育点。" +
    "颜料优先：石青、朱红、蛤白、烟墨、大理蓝白搭配。德育优先：清白传家、耕读相继。" +
    "口语化表达，不要照搬长文。" +
    excerptBlock
  );
}

export function pickRandomQuickQuestion(): string {
  const list = QUICK_QUESTION_TEMPLATES;
  return list[Math.floor(Math.random() * list.length)];
}

export function buildStudentSystemInstruction(
  knowledgeExcerpt: string[] = [],
): string {
  const excerptBlock =
    knowledgeExcerpt.length > 0
      ? `\n【知识库摘录】\n${knowledgeExcerpt.map((l) => `- ${l}`).join("\n")}`
      : "";

  return (
    "你是「小草」，大理白族民居彩绘的儿童智慧精灵。" +
    "用温暖、童趣的中文与小学生交流，可适当融入白语词（如 Da xif），正文不超过150字。" +
    "结构：先给一句好懂的结论，再讲1个小故事或观察方法，可选1个动手小建议。" +
    "涉及颜料时优先：石青、朱红、蛤白、烟墨、大理蓝白搭配。德育优先：清白传家、耕读相继。" +
    "口语化表达，不要照搬长文，不要说教式论文体。" +
    excerptBlock
  );
}

export function canvasDemoHint(topic: string): string {
  const short = topic.replace(/^白族文化主题研学课\s*[-–—]\s*/, "").slice(0, 24);
  return `已根据本课「${short}」勾描示范线稿，可参考墨线起笔。`;
}
