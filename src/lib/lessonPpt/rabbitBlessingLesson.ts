import type { AiGeneratedPlan, LessonSlide } from "./types";

export function isRabbitBlessingTopic(topic: string) {
  const normalized = topic.replace(/[“”‘’\s、，。,.：:；;!！?？]/g, "");
  const mentionsRabbit = /小?白?兔/.test(normalized);
  const mentionsLingzhi = /灵芝(?:草)?/.test(normalized);
  return mentionsRabbit && mentionsLingzhi;
}

export const RABBIT_BLESSING_PLAN: AiGeneratedPlan = {
  title: "小白兔衔来的祝福",
  subtitle: "认识“兔含灵芝草”纹样 · 小学三至五年级 · 15分钟",
  parts: [
    {
      name: "1. 看纹样与听故事",
      desc: "观察纹样中的小兔与灵芝草，听一只小白兔把祝福带进白族院子的故事。",
      tip: "先让学生自由寻找动物和植物，再追问小兔嘴里衔着什么。",
    },
    {
      name: "2. 解码吉祥寓意",
      desc: "认识小兔的温和灵巧、灵芝草寄托的健康吉祥愿望，以及卷草纹连接画面的作用。",
      tip: "用学生熟悉的祝福词解释纹样含义，避免堆叠生僻术语。",
    },
    {
      name: "3. 创作祝福纹样卡",
      desc: "画出长耳朵和短尾巴，让小兔衔着一种祝福植物，再加入卷草纹、云纹或花朵。",
      tip: "黑色线描加一种重点色即可，五分钟内先画清楚，再添装饰。",
    },
    {
      name: "4. 分享作品中的祝福",
      desc: "学生用一句话介绍小兔、它衔着的植物，以及这幅纹样代表的祝福。",
      tip: "评价时关注兔子的特征、兔子与植物的联系，以及祝福是否表达清楚。",
    },
  ],
  suggestions: [
    "课堂任务：完成一张祝福纹样卡",
    "祝福词可选平安、健康、快乐、成长或团圆",
    "原始课件可下载保存，用于课堂离线播放",
  ],
};

const slideCopy = [
  ["小白兔衔来的祝福", "认识兔含灵芝草纹样"],
  ["纹样里藏着什么", "找一找小兔与它嘴里衔着的植物"],
  ["小白兔衔来的祝福", "小白兔从山坡跑来，把一株灵芝草和祝福带进院子"],
  ["兔子为什么和灵芝草画在一起", "小兔、灵芝草与卷草纹共同表达健康和吉祥"],
  ["一幅纹样怎样讲出祝福", "主人公、祝福植物与卷草纹组成完整故事"],
  ["创作一只祝福小兔", "完成一张黑色线描加一种重点色的祝福纹样卡"],
  ["5分钟完成祝福纹样", "画小兔、定动作、添植物、加纹样"],
  ["用一句话介绍作品", "说清小兔、植物和祝福的含义"],
  ["兔含灵芝草纹样", "兔子带来祝福，植物说出愿望"],
] as const;

export const RABBIT_BLESSING_SLIDES: LessonSlide[] = slideCopy.map(
  ([title, body], index) => ({
    layout: "full-image",
    tag: `第${index + 1}页`,
    title,
    body,
    imageUrl: `/lesson-ppts/rabbit-blessing/slide-${index + 1}.png`,
    imageCaption: `${title}课件页`,
  }),
);

export const RABBIT_BLESSING_PPTX_URL =
  "/lesson-ppts/rabbit-blessing/%E5%B0%8F%E7%99%BD%E5%85%94%E8%A1%94%E6%9D%A5%E7%9A%84%E7%A5%9D%E7%A6%8F_15%E5%88%86%E9%92%9F%E5%BE%AE%E8%AF%BE.pptx";
