import { loadPptKnowledgeManifest } from "../lessonPpt/knowledgeBase";
import type { PptKnowledgeManifest } from "../lessonPpt/types";

export type StudentDialogueMaterial = {
  id: string;
  category: string;
  question: string;
  hint?: string;
  entryId?: string;
};

/** 学生对话素材：按知识库条目 id 映射儿童化提问（真源见 skill knowledge-base.md） */
const ENTRY_STUDENT_QUESTIONS: Record<
  string,
  { category: string; questions: Array<{ q: string; hint?: string }> }
> = {
  "bai-spatial-layout": {
    category: "空间布局",
    questions: [
      { q: "三坊一照壁是什么意思呀？", hint: "∏形合院与照壁挡风" },
      { q: "漏角天井是干什么用的？", hint: "排水、采光与通风" },
    ],
  },
  "bai-folk-paint": {
    category: "色彩彩绘",
    questions: [
      { q: "什么是大理蓝白搭配？", hint: "石青、蛤白与青瓦白墙" },
      { q: "照壁上常画什么纹样？", hint: "蝴蝶、花卉、山水与榜书" },
    ],
  },
  "butterfly-motif": {
    category: "纹样寓意",
    questions: [
      { q: "蝴蝶纹代表什么吉祥意思？", hint: "生命繁衍与灵动" },
      { q: "为什么喜洲彩绘里蝴蝶很常见？", hint: "生态与扎染文化" },
    ],
  },
  "bai-symbol-ethics": {
    category: "家风故事",
    questions: [
      { q: "照壁写着「清白传家」是什么故事？", hint: "杨震暮夜却金" },
      { q: "山花纹样里莲花象征什么？", hint: "连级升华与高洁" },
    ],
  },
  "bai-craft-materials": {
    category: "营造工艺",
    questions: [
      { q: "纸筋灰是做什么用的？", hint: "彩绘底料与湿画法" },
      { q: "白族彩绘为什么能很多年不褪色？", hint: "半干绘制与矿物颜料" },
    ],
  },
  "bai-building-art-database": {
    category: "民居探秘",
    questions: [
      { q: "白族人家为什么喜欢盖照壁？", hint: "挡西风、反光入堂屋" },
      { q: "喜洲严家大院有什么特别之处？", hint: "四合五天井与六合同春" },
    ],
  },
};

const BAI_LANGUAGE_MATERIALS: StudentDialogueMaterial[] = [
  {
    id: "bai-da-xif",
    category: "白语小课堂",
    question: "白语里「大吉大利」怎么说呀？",
    hint: "Da xif — 吉祥恭喜",
  },
  {
    id: "bai-bailizi",
    category: "白语小课堂",
    question: "「白族人」用白语怎么说？",
    hint: "Bailizi",
  },
  {
    id: "bai-hei-mo",
    category: "白语小课堂",
    question: "画得好的时候可以说什么白语？",
    hint: "Hei mo — 很好",
  },
];

const FALLBACK_MATERIALS: StudentDialogueMaterial[] = [
  {
    id: "fb-color",
    category: "色彩彩绘",
    question: "为什么白族人偏爱大理蓝白搭配？",
  },
  {
    id: "fb-topic",
    category: "纹样寓意",
    question: "喜洲彩绘最常用的传统题材有哪些？",
  },
  {
    id: "fb-ethics",
    category: "家风故事",
    question: "照壁里写着「清白传家」是什么故事？",
  },
  ...BAI_LANGUAGE_MATERIALS,
];

function materialsFromManifest(
  manifest: PptKnowledgeManifest,
): StudentDialogueMaterial[] {
  const materials: StudentDialogueMaterial[] = [];
  const knownIds = new Set(manifest.entries.map((e) => e.id));

  for (const entry of manifest.entries) {
    const mapped = ENTRY_STUDENT_QUESTIONS[entry.id];
    if (mapped) {
      mapped.questions.forEach((item, idx) => {
        materials.push({
          id: `${entry.id}-${idx}`,
          category: mapped.category,
          question: item.q,
          hint: item.hint,
          entryId: entry.id,
        });
      });
      continue;
    }
    if (entry.title && entry.keywords.length > 0) {
      const kw = entry.keywords[0];
      materials.push({
        id: `${entry.id}-auto`,
        category: entry.title.slice(0, 8),
        question: `你能讲讲「${kw}」和白族彩绘的关系吗？`,
        entryId: entry.id,
      });
    }
  }

  for (const [entryId, mapped] of Object.entries(ENTRY_STUDENT_QUESTIONS)) {
    if (!knownIds.has(entryId)) {
      mapped.questions.forEach((item, idx) => {
        materials.push({
          id: `${entryId}-fb-${idx}`,
          category: mapped.category,
          question: item.q,
          hint: item.hint,
          entryId,
        });
      });
    }
  }

  return [...materials, ...BAI_LANGUAGE_MATERIALS];
}

export type StudentDialogueCategory = {
  name: string;
  materials: StudentDialogueMaterial[];
};

export function groupMaterialsByCategory(
  materials: StudentDialogueMaterial[],
): StudentDialogueCategory[] {
  const map = new Map<string, StudentDialogueMaterial[]>();
  for (const m of materials) {
    const list = map.get(m.category) ?? [];
    list.push(m);
    map.set(m.category, list);
  }
  return [...map.entries()].map(([name, items]) => ({
    name,
    materials: items,
  }));
}

export async function loadStudentDialogueLibrary(): Promise<{
  materials: StudentDialogueMaterial[];
  categories: StudentDialogueCategory[];
}> {
  try {
    const manifest = await loadPptKnowledgeManifest();
    if (manifest.entries.length > 0) {
      const materials = materialsFromManifest(manifest);
      return {
        materials,
        categories: groupMaterialsByCategory(materials),
      };
    }
  } catch {
    /* 回退静态素材 */
  }

  return {
    materials: FALLBACK_MATERIALS,
    categories: groupMaterialsByCategory(FALLBACK_MATERIALS),
  };
}

export function pickRandomStudentQuestion(
  materials: StudentDialogueMaterial[],
): string {
  const pool = materials.length > 0 ? materials : FALLBACK_MATERIALS;
  return pool[Math.floor(Math.random() * pool.length)].question;
}
