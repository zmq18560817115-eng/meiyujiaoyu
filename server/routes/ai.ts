import { Router } from 'express';
import type { GoogleGenAI } from '@google/genai';
import {
  buildOfflineStudentReply,
  buildOfflineTeacherReply,
  buildStudentSystemInstruction,
  buildTeacherSystemInstruction,
  matchKnowledgeBulletsForChat,
} from '../lib/xiaochaAi.js';

export function createAiRouter(ai: GoogleGenAI | null) {
  const router = Router();

  router.post('/chat', async (req, res) => {
    const { message, history, role, lessonTopic } = req.body;
    if (!message) {
      res.status(400).json({ code: 400, message: 'Missing required parameter: message', data: null });
      return;
    }

    const isTeacher = role === 'teacher';
    const topic = String(lessonTopic || '大理白族民居彩绘').trim();
    const knowledgeBullets = matchKnowledgeBulletsForChat(
      isTeacher ? `${message} ${topic}` : String(message),
    );
    const systemInstruction = isTeacher
      ? buildTeacherSystemInstruction(topic, knowledgeBullets)
      : buildStudentSystemInstruction(knowledgeBullets);

    if (ai) {
      try {
        const formattedContents = history
          ? history.map((h: { sender: string; text: string }) => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            }))
          : [];

        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: formattedContents,
          config: { systemInstruction, temperature: 0.7 },
        });

        res.json({
          code: 0,
          message: 'ok',
          data: {
            text: response.text || '请再说一次吧！',
            source: 'Gemini AI',
          },
        });
        return;
      } catch (err) {
        console.error('Gemini Chat Error:', err);
      }
    }

    const offline = isTeacher
      ? buildOfflineTeacherReply(String(message), topic, knowledgeBullets)
      : buildOfflineStudentReply(String(message), knowledgeBullets);
    res.json({ code: 0, message: 'ok', data: offline });
  });

  router.post('/prepare', async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ code: 400, message: 'Missing parameter: topic', data: null });
      return;
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `你是小学美术教师的白族非遗备课助手。请严格依据教师输入的主题、年级、课时、目标和素材生成可执行教案，不把课时固定为15分钟。教师输入：“${topic}”。输出简洁中文JSON：{ "title","subtitle","parts":[{"name","desc","tip"}],"suggestions":[] }。parts为3至4步，每步写清时间、学生任务和教师动作；避免空泛套话与生僻术语。`,
          config: { responseMimeType: 'application/json', temperature: 0.7 },
        });
        const parsed = JSON.parse(response.text || '{}');
        res.json({ code: 0, message: 'ok', data: parsed });
        return;
      } catch (err) {
        console.error('Gemini Prepare Error:', err);
      }
    }

    const brief = String(topic).trim();
    const readField = (name: string) => {
      const match = brief.match(new RegExp(`${name}：([^；]+)`));
      return match?.[1]?.trim() || '';
    };
    const subject = readField('主题') || brief;
    const grade = readField('适用年级') || '1-6 年级';
    const duration = readField('课时') || '15分钟';
    const goal = readField('学习目标');
    const materials = readField('指定素材');
    const minuteMatch = duration.match(/(\d+)/);
    const totalMinutes = minuteMatch ? Number(minuteMatch[1]) : duration.includes('两课时') ? 80 : 15;
    const introMinutes = Math.max(3, Math.round(totalMinutes * 0.25));
    const exploreMinutes = Math.max(5, Math.round(totalMinutes * 0.4));
    const createMinutes = Math.max(5, totalMinutes - introMinutes - exploreMinutes);
    const normalized = subject.toLowerCase();
    const focus = normalized.includes('色') || normalized.includes('蓝白')
      ? {
          evidence: '比较石青、朱红、蛤白在白墙上的明暗与冷暖关系',
          practice: '先自选主色完成一版，再用小色卡验证一种对比方案',
          question: '哪一种颜色最能代表你的感受？为什么？',
        }
      : normalized.includes('工艺') || normalized.includes('扎染') || normalized.includes('材料') || normalized.includes('拓印') || normalized.includes('树叶') || normalized.includes('制作')
        ? {
            evidence: '观察材料、工具和制作顺序，找出每一步留下的手工痕迹',
            practice: '分组完成一个安全、可复现的工艺小样并记录步骤',
            question: '哪一步最影响最后的纹理或形状？',
          }
        : normalized.includes('故事') || normalized.includes('家声') || normalized.includes('照壁')
          ? {
              evidence: '从题字、人物和边饰中寻找故事证据，区分看见的内容与自己的猜想',
              practice: '用三格故事卡重述寓意，并设计一处对应的照壁装饰',
              question: '画面里的哪一个细节最能说明这个故事？',
            }
          : {
              evidence: `观察“${subject}”的外形、重复方式和象征含义`,
              practice: `先独立画出“${subject}”的基本结构，再加入一种个人变化`,
              question: '你从哪些线条或形状看出了它的特点？',
            };

    res.json({
      code: 0,
      message: 'ok',
      data: {
        title: `白族文化主题研学课 - ${subject}`,
        subtitle: `${grade} / ${duration} / 大理白族非遗课程`,
        parts: [
          {
            name: `1. 观察与提问 (${introMinutes}分钟)`,
            desc: `从孩子熟悉的生活场景认识“${subject}”，先看实物或图片，再回答：“${focus.question}”`,
            tip: materials ? `优先展示教师指定素材：${materials}，只追问一个可观察的问题。` : '使用本地照片或照壁故事图导入，先观察再解释。',
          },
          {
            name: `2. 对照鉴赏与示范 (${exploreMinutes}分钟)`,
            desc: goal ? `${goal}。学习时重点${focus.evidence}。` : `结合3D全景和局部图，${focus.evidence}。`,
            tip: `面向${grade}使用短句提问，每次只讲一个知识点，并邀请学生用自己的话复述。`,
          },
          {
            name: `3. 自主创作与分享 (${createMinutes}分钟)`,
            desc: `学生${focus.practice}，完成后再选择是否查看一条AI建议，并说明采纳或保留原方案的理由。`,
            tip: '先肯定孩子自己的观察和配色理由，再给一条可执行的修改建议。',
          },
        ],
        suggestions: [
          `课后用一句话检查目标：${goal || `我能说出“${subject}”的一个特点`}`,
          '优秀习作可更新入学校展示画廊，同时保留学生的原始方案。',
        ],
      },
    });
  });

  router.post('/ai-motif', async (req, res) => {
    const { idea } = req.body;
    if (!idea) {
      res.status(400).json({ code: 400, message: 'Missing parameter: idea', data: null });
      return;
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `学生白族彩绘创意：“${idea}”。输出JSON：{ "colors":[],"colorExplanation":"","culturalMeaning":"" }`,
          config: { responseMimeType: 'application/json', temperature: 0.8 },
        });
        const parsed = JSON.parse(response.text || '{}');
        res.json({ code: 0, message: 'ok', data: parsed });
        return;
      } catch (err) {
        console.error('Gemini AI Motif error:', err);
      }
    }

    res.json({
      code: 0,
      message: 'ok',
      data: {
        colors: ['石青', '朱红', '蛤白'],
        colorExplanation: '石青打底、朱红勾边、蛤白提亮，呈现大理经典蓝白对比。',
        culturalMeaning: `你所描绘的“${idea}”在白族习俗中寓意吉祥与传承。`,
      },
    });
  });

  return router;
}
