import { Router } from 'express';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import { requireTeacher, type AuthedRequest } from '../lib/auth.js';
import type { GoogleGenAI } from '@google/genai';

export function createWhiteboardRouter(ai: GoogleGenAI | null) {
  const router = Router();
  const defaultSessionId = 'class-default';

  function getSession(sessionId: string) {
    const store = loadStore();
    if (!store.whiteboards[sessionId]) {
      store.whiteboards[sessionId] = {
        title: '双廊小学三四年级非遗彩绘灵感整理板',
        notes: [
          {
            id: '1',
            x: 120,
            y: 70,
            text: '耕读传家：白族彩绘精神精髓',
            color: '#ffea79',
            author: '徐老师',
          },
        ],
      };
      mutateStore((s) => {
        s.whiteboards[sessionId] = store.whiteboards[sessionId];
      });
    }
    return loadStore().whiteboards[sessionId];
  }

  router.get('/:sessionId', requireTeacher, (req: AuthedRequest, res) => {
    const session = getSession(req.params.sessionId || defaultSessionId);
    ok(res, { whiteboard: session });
  });

  router.put('/:sessionId/canvas', requireTeacher, (req: AuthedRequest, res) => {
    const { canvasDataUrl } = req.body;
    const sid = req.params.sessionId || defaultSessionId;
    mutateStore((s) => {
      if (!s.whiteboards[sid]) {
        s.whiteboards[sid] = { title: '智慧白板', notes: [] };
      }
      s.whiteboards[sid].canvasDataUrl = canvasDataUrl;
    });
    ok(res, { saved: true });
  });

  router.post('/:sessionId/notes', requireTeacher, (req: AuthedRequest, res) => {
    const { text, color, x, y, author } = req.body;
    if (!text?.trim()) {
      fail(res, '便利贴内容不能为空');
      return;
    }
    const sid = req.params.sessionId || defaultSessionId;
    const note = {
      id: newId('note'),
      x: x ?? 50 + Math.random() * 320,
      y: y ?? 50 + Math.random() * 150,
      text: text.trim(),
      color: color || '#ffea79',
      author: author || req.teacher?.name || '老师',
    };

    mutateStore((s) => {
      if (!s.whiteboards[sid]) {
        s.whiteboards[sid] = { title: '智慧白板', notes: [] };
      }
      s.whiteboards[sid].notes.push(note);
    });

    ok(res, { note }, 201);
  });

  router.delete('/:sessionId/notes/:noteId', requireTeacher, (req: AuthedRequest, res) => {
    const sid = req.params.sessionId || defaultSessionId;
    let removed = false;
    mutateStore((s) => {
      const board = s.whiteboards[sid];
      if (!board) return;
      const before = board.notes.length;
      board.notes = board.notes.filter((n) => n.id !== req.params.noteId);
      removed = board.notes.length < before;
    });
    if (!removed) {
      fail(res, '便利贴不存在', 404, 404);
      return;
    }
    ok(res, { deleted: true });
  });

  router.post('/structure', requireTeacher, async (req: AuthedRequest, res) => {
    const { topic } = req.body;
    if (!topic?.trim()) {
      fail(res, '缺少 topic');
      return;
    }

    const fallbackCards = [
      `【核心】${topic}的彩绘构图`,
      `【设色】以石青和大理蓝为主打底线`,
      `【传承】将传统飞蝶融入植物泥金`,
      `【德育】清白传家与耕读相继`,
    ];

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `针对彩绘主题"${topic}"，输出3-4条美育知识点卡片。严格 JSON 数组字符串，每项为一句中文，例如 ["【核心】标题：内容"]`,
          config: { responseMimeType: 'application/json', temperature: 0.7 },
        });
        const parsed = JSON.parse(response.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          ok(res, { cards: parsed, title: `思维重构板: ${topic}` });
          return;
        }
      } catch (e) {
        console.error('Whiteboard structure AI error:', e);
      }
    }

    ok(res, { cards: fallbackCards, title: `思维重构板: ${topic}` });
  });

  return router;
}
