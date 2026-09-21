import { loadStore } from './store.js';
import type { PptKnowledgeEntryRecord } from './pptKnowledge.js';

function scoreEntry(query: string, entry: PptKnowledgeEntryRecord): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const kw of entry.keywords) {
    if (q.includes(kw.toLowerCase())) score += 2;
  }
  if (q.includes(entry.title.toLowerCase())) score += 3;
  return score;
}

export function matchKnowledgeBulletsForChat(
  query: string,
  max = 3,
): string[] {
  const store = loadStore();
  const entries = store.pptKnowledge?.entries ?? [];
  const ranked = [...entries]
    .map((e) => ({ e, score: scoreEntry(query, e) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return [];

  const bullets: string[] = [];
  for (const { e } of ranked.slice(0, 2)) {
    const lines = e.theoryContent
      .split(/\n/)
      .map((l) => l.replace(/^[-*#\d.]+\s*/, '').trim())
      .filter((l) => l.length > 8 && l.length < 80);
    bullets.push(...lines.slice(0, 2));
  }
  return [...new Set(bullets)].slice(0, max);
}

export function buildTeacherSystemInstruction(
  lessonTopic: string,
  knowledgeExcerpt: string[] = [],
): string {
  const excerptBlock =
    knowledgeExcerpt.length > 0
      ? `\n【知识库摘录】\n${knowledgeExcerpt.map((l) => `- ${l}`).join('\n')}`
      : '';

  return (
    "你是「小茶」，大理白族民居彩绘美育系统的教师智慧助教。" +
    '用温暖、实操的中文回答小学美术教师，正文不超过150字。' +
    `优先结合本课专题「${lessonTopic}」给课堂建议。` +
    '结构：先给结论，再给1–2条课堂做法，可选1条文化或德育点。' +
    '颜料优先：石青、朱红、蛤白、烟墨、大理蓝白搭配。德育优先：清白传家、耕读相继。' +
    '口语化表达，不要照搬长文。' +
    excerptBlock
  );
}

export function buildOfflineTeacherReply(
  message: string,
  lessonTopic: string,
  knowledgeBullets: string[] = [],
): { text: string; source: string } {
  const text = String(message).toLowerCase();

  if (text.includes('名字') || text.includes('小茶')) {
    return {
      text: '您好，徐老师！我是非遗教学智慧助教小茶，可协助您备课、解读白族彩绘文化与课堂互动设计。',
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('颜色') || text.includes('色彩') || text.includes('蓝白')) {
    const extra = knowledgeBullets[0] ? ` ${knowledgeBullets[0]}` : '';
    return {
      text: `白族彩绘讲究石青、朱红、蛤粉与墨色，青瓦白墙上对比强烈，被称为大理蓝白搭配。课堂上可让孩子先辨三色，再试「白墙挂重蓝」。${extra}`.slice(
        0,
        150,
      ),
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('照壁') || text.includes('三坊')) {
    const extra =
      knowledgeBullets[0] ?? '照壁挡西风、反射阳光，常题「清白传家」。';
    return {
      text: `关于「${lessonTopic}」：${extra} 建议先带学生看照壁题字区，再勾墨线框，强调礼制与家风。`.slice(
        0,
        150,
      ),
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('墨线') || text.includes('勾线') || text.includes('毛笔')) {
    return {
      text: '墨线教学宜「慢—稳—停」：起笔轻、行笔匀、收笔顿。可让学生先描照壁边框，再用拟人法说「小墨虫爬墙」，降低握笔焦虑。',
      source: '本地智库离线算法',
    };
  }

  if (text.includes('评价') || text.includes('点评') || text.includes('怎么改')) {
    return {
      text: '先给一句核心结论，再说“做得好”和“下次试试”各1点。面向学生可说：画面主题很清楚；下次把最重要的纹样画得更突出。专业依据放在展开区给教师查看。',
      source: '本地教学策略库',
    };
  }

  if (text.includes('活动') || text.includes('课堂') || text.includes('怎么教') || text.includes('设计')) {
    const fact = knowledgeBullets[0] ? `知识切入：${knowledgeBullets[0]} ` : '';
    return {
      text: `${fact}建议用“看一看—说一说—画一画—讲一讲”四步：先观察实物或全景，再让学生描述特点，独立创作，最后用一句话分享选择理由。`.slice(0, 180),
      source: knowledgeBullets[0] ? '洱海苍山非遗教学智库' : '本地教学策略库',
    };
  }

  if (text.length < 5 || /^(怎么|如何|为什么)[？?]?$/.test(text.trim())) {
    return {
      text: '我可以一起设计。请再告诉我三个条件中的任意一个：学生年级、可用课时、希望学生最后会做什么。我会按你的真实课堂条件给出步骤。',
      source: '小茶备课引导',
    };
  }

  const bullet = knowledgeBullets.slice(0, 2).join('；');
  return {
    text: bullet
      ? `先说结论：${bullet}。结合“${lessonTopic}”，可让学生先找图中证据，再用自己的话解释，最后通过小幅创作验证理解。`.slice(0, 180)
      : `这个问题可以继续展开。为了避免给出空泛答案，请补充学生年级、课时或课堂目标；我会按“导入—观察—创作—评价”生成可直接使用的建议。`,
    source: bullet ? '洱海苍山非遗教学智库' : '本地智库离线算法',
  };
}

export function buildStudentSystemInstruction(
  knowledgeExcerpt: string[] = [],
): string {
  const excerptBlock =
    knowledgeExcerpt.length > 0
      ? `\n【知识库摘录】\n${knowledgeExcerpt.map((l) => `- ${l}`).join('\n')}`
      : '';

  return (
    "你是「小草」，大理白族民居彩绘的儿童智慧精灵。" +
    '用温暖、童趣的中文与小学生交流，可适当融入白语词（如 Da xif），正文不超过150字。' +
    '结构：先给一句好懂的结论，再讲1个小故事或观察方法，可选1个动手小建议。' +
    '涉及颜料时优先：石青、朱红、蛤白、烟墨、大理蓝白搭配。德育优先：清白传家、耕读相继。' +
    '口语化表达，不要照搬长文，不要说教式论文体。' +
    excerptBlock
  );
}

export function buildOfflineStudentReply(
  message: string,
  knowledgeBullets: string[] = [],
): { text: string; source: string } {
  const text = String(message).toLowerCase();

  if (text.includes('名字') || text.includes('小草')) {
    return {
      text: '你好呀！我是大理白族彩绘的智慧精灵「小草」，很高兴陪你发现家乡照壁和纹样里的小秘密！',
      source: '洱海苍山非遗教学智库',
    };
  }

  if (
    text.includes('白语') ||
    text.includes('大吉') ||
    text.includes('da xif') ||
    text.includes('daxi')
  ) {
    return {
      text: '白语里祝福可以说 Da xif（大吉）！画得好的时候，你也可以大声说 Hei mo（很好）鼓励同学哦。',
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('颜色') || text.includes('色彩') || text.includes('蓝白')) {
    const extra = knowledgeBullets[0] ? ` ${knowledgeBullets[0]}` : '';
    return {
      text: `白族彩绘最爱石青、朱红和蛤白，青瓦白墙上对比特别鲜明，这叫大理蓝白搭配。你可以先在画板上试试「白墙挂重蓝」。${extra}`.slice(
        0,
        150,
      ),
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('照壁') || text.includes('清白') || text.includes('家风')) {
    const extra =
      knowledgeBullets[0] ?? '照壁挡西风，白色墙面还能把阳光送进屋里。';
    return {
      text: `照壁就像院子里的「大屏风」！${extra} 「清白传家」讲的是杨震拒收黄金、清廉传家的故事。`.slice(
        0,
        150,
      ),
      source: '洱海苍山非遗教学智库',
    };
  }

  if (text.includes('蝴蝶') || text.includes('纹样')) {
    const extra = knowledgeBullets[0] ?? '蝴蝶纹象征吉祥与灵动。';
    return {
      text: `${extra} 你可以先观察 3D 全景里的纹样，再到智能设色画板里给蝴蝶填色。`.slice(
        0,
        150,
      ),
      source: '洱海苍山非遗教学智库',
    };
  }

  const bullet = knowledgeBullets[0];
  return {
    text: bullet
      ? `关于你的问题：${bullet} 试着用今天学的颜色，在画板上涂出你的理解吧！`
      : `关于「${message}」，在大理白族彩绘里常寄托吉祥与读书传家的美好心愿。去素材库再挑一个话题问我吧！`,
    source: bullet ? '洱海苍山非遗教学智库' : '本地智库离线算法',
  };
}
