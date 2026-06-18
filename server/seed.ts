import {
  INITIAL_COURSES,
  INITIAL_RESOURCES,
  INITIAL_STUDENT_WORKS,
  MOCK_STUDENTS_PROGRESS,
  ANNOUNCEMENTS,
} from '../src/data/mockData.js';
import {
  DEFAULT_TEACHERS,
  DEFAULT_STUDENTS,
} from '../src/data/accounts.js';
import { createDefaultPptKnowledge } from './lib/pptKnowledge.js';

export { DEFAULT_TEACHERS, DEFAULT_STUDENTS };

export const DEFAULT_HOTSPOTS = [
  {
    id: 'roof',
    sceneId: 'xiyuan',
    x: '50%',
    y: '15%',
    title: '高悬飞檐与斗拱彩绘',
    bilingual: 'Roof Eaves & Bracket Paint',
    desc: '白族建筑的飞檐如同大鹏展翅，极其生灵飞扬。在斗拱的木质结合部，常绘有‘金妆青绿’或几何寿字纹理。既是对建筑风雨腐蚀的物理保护，更是向天空表达白族人亲近自然的崇高敬意。',
  },
  {
    id: 'gate',
    sceneId: 'xiyuan',
    x: '50%',
    y: '45%',
    title: '一门两窗与“清白”门头',
    bilingual: 'Main Entrance & Lintels',
    desc: '标准的牌楼式大门，常带有‘泥塑描黑，金石题额’。门脊下饰有一排极其精美的手工白粉彩绘，画着喜鹊登梅。象征着开门迎春、书香流传，也是白族耕读文化的核心窗口。',
  },
  {
    id: 'wall',
    sceneId: 'xiyuan',
    x: '15%',
    y: '60%',
    title: '‘清白传家’照壁水墨',
    bilingual: 'Classic Reflections Wall',
    desc: '大理风大光强，照壁（影壁）通常正对堂屋。涂刷蛤粉的亮白墙面，能折射下午的强光。底框一般用松石绿，中央画巨幅荷花水墨，上书‘清白传家’四大行书字，寓意为官清正、做人坦荡。',
  },
];

export const DEFAULT_SCHEDULES = [
  {
    id: 'sch1',
    time: '09:00 - 09:45',
    className: '四年级一班',
    title: '大理白族彩绘历史背景认知',
    note: '重点赏析：喜洲古镇严家大院青砖素壁。已配套3D全景热点讲解与多感官连线。',
    status: 'active' as const,
  },
  {
    id: 'sch2',
    time: '14:00 - 14:45',
    className: '三年级三班',
    title: '古典纹样生态重构 (蝴蝶与飞燕)',
    note: '配套用具：数字智能白画、蝴蝶密封戳、毛笔勾墨板。',
    status: 'active' as const,
  },
  {
    id: 'sch3',
    time: '15:30 - 16:15',
    className: '非遗创绘兴趣班',
    title: '人机共创白族彩绘填色实操',
    note: '活动引导：让孩子们撰写“自豪感日记”，并在画廊分享自己的石青配色方案。',
    status: 'pending' as const,
  },
];

export function createDefaultStore() {
  return {
    teachers: DEFAULT_TEACHERS.map(({ id, workId, name, password }) => ({
      id,
      workId,
      name,
      password,
    })),
    students: DEFAULT_STUDENTS.map(
      ({ id, studentNo, name, classCode, grade, password }) => ({
        id,
        studentNo,
        name,
        classCode,
        grade,
        password,
      }),
    ),
    sessions: {} as Record<string, { teacherId: string; name: string; createdAt: number }>,
    studentSessions: {} as Record<
      string,
      { studentId: string; name: string; grade: string; createdAt: number }
    >,
    courses: [...INITIAL_COURSES],
    resources: [...INITIAL_RESOURCES],
    artworks: [...INITIAL_STUDENT_WORKS],
    announcements: [...ANNOUNCEMENTS],
    stats: { ...MOCK_STUDENTS_PROGRESS, prideScore: 89.4 },
    schedules: [...DEFAULT_SCHEDULES],
    hotspots: [...DEFAULT_HOTSPOTS],
    artworkLikes: {} as Record<string, string[]>,
    projection: { hotspotId: 'gate', active: false, updatedAt: Date.now() },
    whiteboards: {} as Record<
      string,
      {
        title: string;
        notes: Array<{ id: string; x: number; y: number; text: string; color: string; author: string }>;
        canvasDataUrl?: string;
      }
    >,
    pptKnowledge: createDefaultPptKnowledge(),
  };
}

export type DataStore = ReturnType<typeof createDefaultStore>;
