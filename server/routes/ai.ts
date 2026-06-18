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
          contents: `针对大理白族民居彩绘课题：“${topic}”，生成15分钟备课JSON：{ "title","subtitle","parts":[{"name","desc","tip"}],"suggestions":[] }`,
          config: { responseMimeType: 'application/json', temperature: 0.7 },
        });
        const parsed = JSON.parse(response.text || '{}');
        res.json({ code: 0, message: 'ok', data: parsed });
        return;
      } catch (err) {
        console.error('Gemini Prepare Error:', err);
      }
    }

    res.json({
      code: 0,
      message: 'ok',
      data: {
        title: `白族文化主题研学课 - ${topic}`,
        subtitle: '适合 1-6 年级 / 大理白族非遗课程',
        parts: [
          {
            name: '1. 主题认知与导入 (4分钟)',
            desc: `揭秘“${topic}”在白族文化中的由来。`,
            tip: '用歌谣唤醒文化想象力。',
          },
          {
            name: '2. 交互大屏鉴赏 (6分钟)',
            desc: '进入3D全景鉴赏模块观察彩绘细节。',
            tip: '示范如意卷云纹的提顿用笔。',
          },
          {
            name: '3. 创意实践 (5分钟)',
            desc: '使用智能白模平台完成设色创作。',
            tip: '鼓励沉默学生勇敢展示作品。',
          },
        ],
        suggestions: ['优秀习作可更新入学校展示画廊', '结合清白传家典故融合德育'],
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
