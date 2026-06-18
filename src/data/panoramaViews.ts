/** 白族墙绘 3D 环视导览视角（地图式多方位切换） */
export type PanoramaViewId =
  | "overview"
  | "wall-center"
  | "eaves-low"
  | "courtyard"
  | "panels"
  | "garden";

/** 与投屏 / WebSocket 同步兼容的旧热点 id */
export type PanoramaSyncId = "gate" | "roof" | "wall";

export interface PanoramaViewLink {
  targetId: PanoramaViewId;
  x: string;
  y: string;
  label: string;
}

export interface PanoramaView {
  id: PanoramaViewId;
  syncId: PanoramaSyncId;
  image: string;
  navLabel: string;
  title: string;
  bilingual: string;
  desc: string;
  caption: string;
  lessonTag: string;
  teachingTip: string;
  /** 教师端课程科普解说（语音朗读稿） */
  narration: string;
  /** 学生端伴读精简稿 */
  studentNarration: string;
  links: PanoramaViewLink[];
}

export const PANORAMA_VIEWS: PanoramaView[] = [
  {
    id: "overview",
    syncId: "gate",
    image: "/panorama/overview.png",
    navLabel: "① 环视总览",
    title: "喜洲照壁·院落环视总览",
    bilingual: "Courtyard Overview",
    desc: "三坊一照壁格局下的白族民居彩绘全景。照壁居中、两厢环抱，灰瓦飞檐与石青墙绘在日光下形成层次分明的非遗空间。",
    caption: "点击画面中的发光导览点，即可切换至对应方位实景。",
    lessonTag: "非遗空间格局",
    teachingTip:
      "可先让学生找一找照壁、厢房与天井三条边界，再点击导览点进入细部视角。",
    narration:
      "同学们，我们现在站在喜洲白族院落正中。大家看，这是典型的三坊一照壁格局：左右两厢房环抱中间天井，正对面那面大白墙就是照壁。白族人把最精彩的墙绘留给照壁，因为下午的阳光会照在上面，再反射进整个院子，既亮堂又寓意清白传家。请大家记住，今天我们要从总览出发，依次看照壁、飞檐和彩绘细部。",
    studentNarration:
      "小草带你看院子全貌啦！中间那面大白墙就是照壁，太阳照上去会把光送进屋里，所以白族人最爱在这里画画。",
    links: [
      { targetId: "wall-center", x: "50%", y: "52%", label: "照壁圆心" },
      { targetId: "eaves-low", x: "50%", y: "18%", label: "飞檐仰角" },
      { targetId: "courtyard", x: "28%", y: "72%", label: "天井廊道" },
      { targetId: "panels", x: "72%", y: "48%", label: "彩绘细部" },
      { targetId: "garden", x: "50%", y: "78%", label: "院落对景" },
    ],
  },
  {
    id: "wall-center",
    syncId: "wall",
    image: "/panorama/wall-center.png",
    navLabel: "② 照壁正面",
    title: "「清白传家」中央照壁",
    bilingual: "Classic Reflection Wall",
    desc: "照壁正中圆形山水与多层蓝白边框，是白族彩绘最集中的展示面。蛤白底色折射午后强光，石青、烟墨勾勒家风题字与吉祥纹样。",
    caption: "正面近景 · 圆心山水与边框彩绘",
    lessonTag: "照壁彩绘要领",
    teachingTip:
      "引导学生观察圆心山水与层层边框的设色层次，可分发线稿比对石青与蛤白面积比例。",
    narration:
      "请大家把目光移到照壁正中。最醒目的是这幅圆形山水，外面一圈圈蓝白相间的边框，就像给画面镶了层层花边。白族照壁常用蛤壳磨成的蛤白做底色，再调入石青、烟墨勾边。你们发现了吗？白色不是空着，而是用来反光、用来留白，让院子在烈日下也清爽明亮。许多照壁上还会题写清白传家，这是把家训直接画在生活里。",
    studentNarration:
      "照壁中间圆圆的像月亮一样的是山水画，外面蓝白条纹像画框。白色能反光，所以大太阳天院子里也不刺眼哦！",
    links: [
      { targetId: "panels", x: "18%", y: "55%", label: "左栏纹样" },
      { targetId: "panels", x: "82%", y: "55%", label: "右栏纹样" },
      { targetId: "overview", x: "8%", y: "8%", label: "返回总览" },
    ],
  },
  {
    id: "eaves-low",
    syncId: "roof",
    image: "/panorama/eaves-low.png",
    navLabel: "③ 飞檐仰角",
    title: "飞檐斗拱与檐下彩绘",
    bilingual: "Eaves & Bracket Paint",
    desc: "低角度仰视可见层层挑出的飞檐、灰塑斗拱与檐下连续彩绘带。夔龙、云纹与石青底线共同构成白族建筑的天际线装饰。",
    caption: "仰视角 · 飞檐与斗拱细部",
    lessonTag: "飞檐斗拱彩绘",
    teachingTip:
      "仰角视角适合讲解夔龙、云纹等檐下纹样，可让学生抬头模仿飞檐上扬的弧线。",
    narration:
      "现在请大家抬起头，从这个低角度往上看。瓦檐一层层挑出，像鸟翼一样向上扬起，这叫飞檐。檐下有斗拱和灰塑，既是承重结构，也是彩绘载体。你们能看到连续的小幅彩绘带吗？常见夔龙、云纹，底色多用石青。石青来自矿物，耐晒耐雨，所以几百年过去颜色仍然沉稳。飞檐彩绘保护木构，也装饰天际线，是白族民居最富动感的一面。",
    studentNarration:
      "抬头看，屋檐翘翘的像鸟翅膀！檐下画着龙和云，蓝色是石青颜料，太阳晒很久也不会轻易掉色。",
    links: [
      { targetId: "panels", x: "50%", y: "42%", label: "檐下彩绘" },
      { targetId: "overview", x: "8%", y: "8%", label: "返回总览" },
    ],
  },
  {
    id: "courtyard",
    syncId: "gate",
    image: "/panorama/courtyard.png",
    navLabel: "④ 天井廊道",
    title: "门廊入内·天井对景",
    bilingual: "Porch to Courtyard",
    desc: "由门廊柱影步入天井，照壁作为视觉焦点迎面展开。两侧木构厢房与铺地光影，呈现白族院落“向内聚合”的空间美学。",
    caption: "由内而外 · 门廊透视照壁",
    lessonTag: "天井空间体验",
    teachingTip:
      "可让学生讨论门廊阴影与天井亮部的对比，理解白族院落向内聚合、藏风聚气的生活智慧。",
    narration:
      "我们换个角度，从门廊往院子里看。柱子在地上投下长长的影子，说明大理阳光非常强烈。白族人把大门开在侧边，进门先看到天井，正前方照壁迎面而立——这是有意的视觉设计，一进门就被家风与彩绘迎接。两侧厢房围合，让家庭活动围绕天井展开：晒谷、养花、过节都在这里。彩绘不只是装饰，它组织空间，也教育后人。",
    studentNarration:
      "从门口往里看，柱子影子长长的，照壁就在正前方等着你。院子中间可以晒太阳、种花草，是全家人一起活动的地方。",
    links: [
      { targetId: "wall-center", x: "52%", y: "38%", label: "照壁正面" },
      { targetId: "overview", x: "8%", y: "8%", label: "返回总览" },
    ],
  },
  {
    id: "panels",
    syncId: "wall",
    image: "/panorama/panels.png",
    navLabel: "⑤ 彩绘细部",
    title: "墙绘边框与侧栏纹样",
    bilingual: "Painted Panel Details",
    desc: "照壁两侧竖栏与上沿横楣的小幅彩绘、浮雕与题字，展示牡丹、山水、几何边框等典型白族墙绘题材与设色层次。",
    caption: "细部近景 · 边框与侧栏墙绘",
    lessonTag: "纹样与设色",
    teachingTip:
      "推荐分发蝴蝶纹、牡丹纹线稿，让学生在本视角下比对边框几何与主画面的主次关系。",
    narration:
      "这一视角我们拉近看彩绘细部。照壁两侧竖栏和上方横楣，由许多小画格组成，每一格可能是山水、牡丹或几何纹样。白族墙绘讲究主从有序：中心大幅山水最显眼，边框纹样起衬托作用。设色上石青稳重、朱红点缀、蛤白留白，三种颜色配合就像一首短诗。同学们可以数一数，这一面照壁用了几种边框样式？这就是民间画工的基本功。",
    studentNarration:
      "靠近看，小格子里有花、有山，还有弯弯曲曲的边框线。蓝色为主，红色点缀，白色留空，搭配起来特别好看！",
    links: [
      { targetId: "wall-center", x: "50%", y: "50%", label: "回到照壁" },
      { targetId: "overview", x: "8%", y: "8%", label: "返回总览" },
    ],
  },
  {
    id: "garden",
    syncId: "wall",
    image: "/panorama/garden.png",
    navLabel: "⑥ 院落对景",
    title: "照壁与庭院花木",
    bilingual: "Garden & Screen Wall",
    desc: "照壁基座前的盆栽与石砌花台，将建筑彩绘与自然草木并置。完整呈现“三坊一照壁”院落中照壁与生活的日常关系。",
    caption: "平视对景 · 照壁与庭院花木",
    lessonTag: "建筑与生活",
    teachingTip:
      "结合盆栽与石砌花台，讨论彩绘艺术如何与日常起居共生，可布置自豪感日记观察任务。",
    narration:
      "最后我们从平视角度看待整个院落。照壁基座前摆着盆栽和石砌花台，建筑彩绘与活的花木放在一起，说明白族人的艺术就在日常生活里。照壁不只是给人看的画，它对面就是家人每天经过的小路。三坊一照壁的妙处，在于把家训、彩绘、花木、阳光都装进一个院子。请同学们想一想：你家门口最显眼的地方，会放什么来提醒自己做怎样的人？",
    studentNarration:
      "照壁前面有花盆和小树，画和花草住在一起。白族人把最美的画放在每天都能看到的地方，提醒大家要清白做人、热爱生活。",
    links: [
      { targetId: "wall-center", x: "50%", y: "40%", label: "照壁正面" },
      { targetId: "overview", x: "8%", y: "8%", label: "返回总览" },
    ],
  },
];

export const PANORAMA_VIEW_MAP = Object.fromEntries(
  PANORAMA_VIEWS.map((v) => [v.id, v]),
) as Record<PanoramaViewId, PanoramaView>;

export function viewIdFromSyncId(syncId: string): PanoramaViewId {
  const found = PANORAMA_VIEWS.find((v) => v.syncId === syncId);
  return found?.id ?? "overview";
}

export function syncIdFromViewId(viewId: PanoramaViewId): PanoramaSyncId {
  return PANORAMA_VIEW_MAP[viewId]?.syncId ?? "gate";
}

export function viewFromSyncId(syncId: string): PanoramaView {
  const id = viewIdFromSyncId(syncId);
  return PANORAMA_VIEW_MAP[id];
}
