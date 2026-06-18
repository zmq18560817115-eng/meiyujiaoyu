import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './storePaths.js';

export type PptKnowledgeImageRecord = {
  id: string;
  assetId: string;
  caption: string;
  mimeType: string;
};

export type PptKnowledgeEntryRecord = {
  id: string;
  title: string;
  keywords: string[];
  theoryContent: string;
  images: PptKnowledgeImageRecord[];
  createdAt: string;
  updatedAt: string;
};

export type PptKnowledgeStore = {
  version: number;
  entries: PptKnowledgeEntryRecord[];
};

export const PPT_KNOWLEDGE_ASSETS_DIR = path.join(DATA_DIR, 'ppt-knowledge', 'assets');
export const PPT_KNOWLEDGE_THEORY_DIR = path.join(DATA_DIR, 'ppt-knowledge', 'theory');

const REPORT_FILENAME = '大理白族民居建筑理论知识分类与数据库检索体系报告.md';
const BUILDING_ART_DB_FILENAME = '大理白族民居营造理论与空间艺术数据库.md';

function loadTheoryFile(filename: string, fallback: string): string {
  const filePath = path.join(PPT_KNOWLEDGE_THEORY_DIR, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return fallback;
}

const THEORY_BAI_FOLK = `# 白族民居彩绘概要

- 白族民居照壁是院落空间的视觉中心，彩绘多题吉祥寓意。
- 常见纹样：蝴蝶、花卉、山水、文字榜书。
- 教学宜从「看纹样—讲寓意—动手设色」三步展开。
- 配色传统上多用石青、土红、藤黄，体现苍山洱海地域特色。`;

const THEORY_BUTTERFLY = `# 蝴蝶纹与飞燕纹

- 蝴蝶纹象征吉祥与生命繁衍，常见于照壁边框与窗棂装饰。
- 飞燕纹强调灵动与对称，适合四年级纹样重构练习。
- 课堂可先观察 3D 全景热点，再迁移到数字白模设色。`;

const THEORY_SPATIAL_LAYOUT = `# 空间布局体系

- 一正两耳：紧凑居住储藏，普通农户形制。
- 三坊一照壁：∏形合院，照壁挡西风并反射阳光，中产阶级经典布局。
- 四合五天井：中心大天井+四角漏角天井，商贾士绅，寓意四方聚财。
- 六合同春：多院纵横贯通，喜洲严家、杨家等显贵大院。
- 走马转角楼：二层通廊连通，雨季楼层穿行，大家族形制。
- 漏角天井：垂直排水枢纽，提供深宅内部呼吸孔隙与采光。`;

const THEORY_CRAFT_MATERIALS = `# 营造工艺与材料系统

- 海东青山石：墙基、门头、横梁刚性支撑，高耐候性。
- 斗拱出挑：平衡屋檐力学；六合门榫卯可拆卸全开启，堂屋庭院虚实转换。
- 粘土青瓦：配合天井形成科学径流控制。
- 熟桐油+猪血石灰浆：木构件油灰抗腐蚀保护。
- 纸筋灰（熟石膏+白棉纸）：彩绘底料；当日未用完须收工前刮除次日重做。`;

const THEORY_SYMBOL_ETHICS = `# 符号学与伦理体系

- 照壁题字映射姓氏家风：杨-清白传家、张-百忍家风、李-青莲遗风、赵-琴鹤家声、王-三槐流芳、刘-禄阁传芳、董-南诏宰辅。
- 山花纹样：生物类（龙凤、蝙蝠、鹤）、植物类（莲花、三节藕、牡丹）、人文类（暗八仙、琴棋书画）。
- 湿壁画法：纸筋灰半干时矿物颜料化学结合，色牢度极高。`;

const THEORY_MODERN_COURTYARD = `# 现代演进：向内微合院

- 向内看策略消解周边杂乱商业环境。
- 退让界面+露角天井消解现代楼房对庭院压迫感。
- 外立面克制开窗，取景千寻塔、苍山山脊、邻里石墙。
- 漏角天井转译为客房私密内庭，传统功能与现代材料共生。`;

const THEORY_METADATA = `# 数据库属性词表

- 空间属性：坐西朝东、三坊一照壁、四合五天井、六合同春、走马转角楼、漏角天井、一正两耳。
- 工艺属性：纸筋灰、湿壁画法、六合门、石砌墙、油灰保护。
- 文化标签：家风家训、照壁题字、山花纹样、素白美学、三节藕。
- 典型案例：喜洲严家大院、董家大院、古建筑群、向内的微合院。`;

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#fff9ee"/>
  <rect x="24" y="24" width="592" height="352" rx="16" fill="#e8f5ea" stroke="#3b2e0b" stroke-width="4"/>
  <path d="M120 300 Q200 120 320 200 T520 140" fill="none" stroke="#28b06e" stroke-width="6" stroke-linecap="round"/>
  <circle cx="480" cy="120" r="36" fill="#ffc526" stroke="#3b2e0b" stroke-width="3"/>
  <text x="320" y="360" text-anchor="middle" font-family="PingFang SC, sans-serif" font-size="20" fill="#3b2e0b">白族照壁彩绘示意</text>
</svg>`;

export function createDefaultPptKnowledge(): PptKnowledgeStore {
  const now = new Date().toISOString();
  const fullReport = loadTheoryFile(REPORT_FILENAME, THEORY_SPATIAL_LAYOUT);
  const buildingArtDb = loadTheoryFile(
    BUILDING_ART_DB_FILENAME,
    THEORY_SPATIAL_LAYOUT,
  );

  return {
    version: 1,
    entries: [
      {
        id: 'bai-building-art-database',
        title: '大理白族民居营造理论与空间艺术数据库',
        keywords: [
          '营造', '空间艺术', '数据库', '溯源', '演进', '干栏', '南诏', '礼制',
          '空间拓扑', '三坊一照壁', '四合五天井', '六合同春', '漏角天井', '下关风',
          '照壁', '彩绘', '木雕', '家风', '清白传家', '纸筋灰', '油灰', '湿画法',
          '山花纹样', '六合门', '透漏雕', '微合院', '向内合院', '非遗', '严家大院',
          '匠领', '体验地图',
        ],
        theoryContent: buildingArtDb,
        images: [
          {
            id: 'img-bai-mural-art-db',
            assetId: 'placeholder-mural',
            caption: '白族民居照壁彩绘示意',
            mimeType: 'image/svg+xml',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-architecture-kb-report',
        title: '大理白族民居建筑理论知识分类与数据库检索体系报告',
        keywords: [
          '白族', '民居', '建筑', '理论', '数据库', '检索', '大理',
          '知识建构', '遗产保护', '元数据', '分类体系',
        ],
        theoryContent: fullReport,
        images: [
          {
            id: 'img-bai-mural',
            assetId: 'placeholder-mural',
            caption: '白族民居照壁彩绘示意',
            mimeType: 'image/svg+xml',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-spatial-layout',
        title: '空间布局体系',
        keywords: [
          '空间布局', '三坊一照壁', '四合五天井', '六合同春', '走马转角楼',
          '漏角天井', '一正两耳', '照壁', '合院', '严家大院',
        ],
        theoryContent: THEORY_SPATIAL_LAYOUT,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-craft-materials',
        title: '营造工艺与材料系统',
        keywords: [
          '营造', '工艺', '材料', '海东青山石', '纸筋灰', '六合门',
          '斗拱', '油灰', '桐油', '湿壁画法', '石砌墙',
        ],
        theoryContent: THEORY_CRAFT_MATERIALS,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-symbol-ethics',
        title: '符号学与伦理体系',
        keywords: [
          '符号学', '照壁', '题字', '家风', '山花', '纹样', '姓氏',
          '清白传家', '琴鹤家声', '三节藕', '彩绘', '湿壁画法',
        ],
        theoryContent: THEORY_SYMBOL_ETHICS,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-modern-courtyard',
        title: '现代演进与向内微合院',
        keywords: [
          '现代', '微合院', '向内', '当代', '转译', '露角天井', '取景',
        ],
        theoryContent: THEORY_MODERN_COURTYARD,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-metadata-glossary',
        title: '数据库属性词表',
        keywords: [
          '元数据', '属性词表', '检索', '标签', '案例', '喜洲', '董家大院',
        ],
        theoryContent: THEORY_METADATA,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'bai-folk-paint',
        title: '白族民居彩绘概要',
        keywords: ['白族', '民居', '彩绘', '照壁', '大理'],
        theoryContent: THEORY_BAI_FOLK,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'butterfly-motif',
        title: '蝴蝶纹与飞燕纹',
        keywords: ['蝴蝶', '纹样', '飞燕', '生态'],
        theoryContent: THEORY_BUTTERFLY,
        images: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function ensurePptKnowledgeAssets() {
  if (!fs.existsSync(PPT_KNOWLEDGE_THEORY_DIR)) {
    fs.mkdirSync(PPT_KNOWLEDGE_THEORY_DIR, { recursive: true });
  }
  if (!fs.existsSync(PPT_KNOWLEDGE_ASSETS_DIR)) {
    fs.mkdirSync(PPT_KNOWLEDGE_ASSETS_DIR, { recursive: true });
  }
  const muralPath = path.join(PPT_KNOWLEDGE_ASSETS_DIR, 'placeholder-mural.svg');
  if (!fs.existsSync(muralPath)) {
    fs.writeFileSync(muralPath, PLACEHOLDER_SVG, 'utf-8');
  }
}

export function mergePptKnowledgeStore(
  existing?: PptKnowledgeStore | null,
): PptKnowledgeStore {
  const defaults = createDefaultPptKnowledge();
  if (!existing?.entries?.length) return defaults;
  const map = new Map(defaults.entries.map((e) => [e.id, e]));
  for (const entry of existing.entries) {
    map.set(entry.id, { ...map.get(entry.id), ...entry });
  }
  return { version: existing.version ?? 1, entries: [...map.values()] };
}
