import React from "react";
import {
  SubPageNav,
  PageBreadcrumb,
  InfoPanel,
  StatChip,
} from "../shared/SubPageNav";
import { BackButtonLabel } from "../icons";
import type { NupulIconName } from "../icons";
import { DIFFUSE_PRESETS, renderDiffuseAccents } from "../ui/DiffuseDecor";
import type { PanoramaHotspot, StudentArtwork } from "../../types";

/* ── 3D 四级：热点深度 ── */
export const HotspotDeepPanel: React.FC<{
  hotspot: PanoramaHotspot | undefined;
  quad: string;
  onQuadChange: (id: string) => void;
}> = ({ hotspot, quad, onQuadChange }) => {
  const quads: Array<{ id: string; label: string; icon: NupulIconName }> = [
    { id: "intro", label: "构件解读", icon: "cube" },
    { id: "motif", label: "纹样拆解", icon: "pattern" },
    { id: "color", label: "设色口诀", icon: "palette" },
    { id: "story", label: "民俗故事", icon: "messages" },
  ];
  if (!hotspot) {
    return (
      <p className="text-caption text-nupul-dark/60 text-center py-8">
        请先选择一个热点
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <PageBreadcrumb segments={["3D全景", "热点深度", hotspot.title]} />
      <SubPageNav
        items={quads}
        active={quad}
        onChange={onQuadChange}
        level="quaternary"
      />
      {quad === "intro" && (
        <InfoPanel title="构件结构图解">
          <p className="text-caption text-nupul-dark/85 leading-relaxed">
            {hotspot.desc}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <StatChip label="双语名称" value={hotspot.bilingual} />
            <StatChip label="文化层级" value="核心构件" />
          </div>
        </InfoPanel>
      )}
      {quad === "motif" && (
        <div className="grid grid-cols-2 gap-3">
          {["如意云纹", "喜鹊登梅", "牡丹富贵", "卷草边饰"].map((m) => (
            <div
              key={m}
              className="bg-white border-2 border-nupul-dark rounded-xl p-3 text-center"
            >
              <span className="text-caption font-bold text-nupul-dark">纹</span>
              <p className="text-caption font-bold text-nupul-dark mt-1">{m}</p>
            </div>
          ))}
        </div>
      )}
      {quad === "color" && (
        <ul className="space-y-2 text-caption font-semibold text-nupul-dark/85">
          <li className="bg-nupul-yellow/30 border-2 border-nupul-dark rounded-xl p-2.5">
            ① 大面积用蛤白或石青打底
          </li>
          <li className="bg-white border-2 border-nupul-dark/20 rounded-xl p-2.5">
            ② 朱红点睛在门楣与花心
          </li>
          <li className="bg-white border-2 border-nupul-dark/20 rounded-xl p-2.5">
            ③ 墨色勾线提顿要有飞白
          </li>
        </ul>
      )}
      {quad === "story" && (
        <p className="text-caption italic text-nupul-dark/80 leading-relaxed bg-white border-2 border-nupul-dark rounded-xl p-4">
          “{hotspot.title}
          ”在大理喜洲代代相传。爷爷说，每一道彩绘都是给家人的祝福信，画在墙上，也画在心里。
        </p>
      )}
    </div>
  );
};

/* ── 3D：历史时间轴 ── */
export const TimelinePanel: React.FC = () => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["3D全景", "彩绘历史时间轴"]} />
    {[
      {
        era: "唐宋",
        title: "南诏宫廷彩绘萌芽",
        note: "金碧山水与花卉纹样进入民间",
      },
      {
        era: "明清",
        title: "喜洲商帮兴盛",
        note: "严家大院等宅院彩绘体系成熟",
      },
      { era: "近代", title: "耕读传家照壁", note: "清白传家等家风大字普及" },
      { era: "今日", title: "数字非遗进校园", note: "青墙粉绘研学舱传承新篇" },
    ].map((item, i) => (
      <div key={i} className="flex gap-3">
        <div className="w-14 shrink-0 bg-nupul-yellow border-2 border-nupul-dark rounded-xl flex items-center justify-center font-bold text-caption">
          {item.era}
        </div>
        <div className="flex-1 bg-nupul-cream border-3 border-nupul-dark rounded-2xl p-3">
          <h6 className="text-secondary font-bold text-nupul-dark">
            {item.title}
          </h6>
          <p className="text-caption text-nupul-dark/75 mt-1">{item.note}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ── 3D：纹样猜猜看 ── */
export const MotifQuizPanel: React.FC = () => {
  const [picked, setPicked] = React.useState<string | null>(null);
  return (
    <div className="space-y-4">
      <PageBreadcrumb segments={["3D全景", "纹样猜猜看"]} />
      <p className="text-caption font-semibold text-nupul-dark/80">
        下图纹样象征什么吉祥寓意？（点击选项）
      </p>
      <div className="aspect-video bg-nupul-cream border-3 border-nupul-dark rounded-2xl flex items-center justify-center text-6xl">
        蝶
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "a", label: "福迭连绵", ok: true },
          { id: "b", label: "清白传家", ok: false },
          { id: "c", label: "松鹤延年", ok: false },
          { id: "d", label: "喜上眉梢", ok: false },
        ].map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPicked(o.id)}
            className={`text-caption font-bold py-3 rounded-xl border-3 cursor-pointer ${
              picked === o.id
                ? o.ok
                  ? "bg-nupul-green border-nupul-dark"
                  : "bg-nupul-orange/15 border-nupul-orange"
                : "bg-white border-nupul-dark/25"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {picked === "a" && (
        <p className="text-caption text-nupul-green-dark font-bold bg-[#eefbf0] border border-nupul-green-dark/30 rounded-xl p-3">
          正确！蝴蝶谐音「福迭」，代表幸福源源不断。
        </p>
      )}
    </div>
  );
};

/* ── 画布：色彩实验室 ── */
export const PaletteLabPanel: React.FC = () => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["智能设色", "色彩实验室"]} />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatChip label="石青" value="主色 60%" />
      <StatChip label="朱红" value="点缀 25%" />
      <StatChip label="蛤白" value="留白 15%" />
    </div>
    <InfoPanel title="大理蓝白搭配法则">
      <p className="text-caption leading-relaxed text-nupul-dark/85">
        白族彩绘忌花哨堆砌。先定大面积冷暖，再在一处花心或门楣用朱红画龙点睛，最后以墨色勾线收束气韵。
      </p>
    </InfoPanel>
    <div className="flex gap-2 h-8 rounded-full overflow-hidden border-2 border-nupul-dark">
      <div className="flex-[6] bg-[#1a365d]" title="石青" />
      <div className="flex-[2.5] bg-[#c53030]" title="朱红" />
      <div className="flex-[1.5] bg-[#f7f5f0]" title="蛤白" />
    </div>
  </div>
);

/* ── 画布：线稿库 ── */
export const TemplateLibPanel: React.FC<{
  onSelect: (t: "peony" | "butterfly") => void;
}> = ({ onSelect }) => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["智能设色", "线稿纹样库"]} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { id: "peony" as const, name: "富贵影壁牡丹", tag: "入门", emoji: "" },
        {
          id: "butterfly" as const,
          name: "苍山如意彩蝶",
          tag: "进阶",
          emoji: "蝶",
        },
      ].map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className="bg-white border-3 border-nupul-dark rounded-2xl p-5 text-left cursor-pointer"
        >
          <span className="text-4xl">{t.name[0]}</span>
          <h6 className="text-secondary font-bold text-nupul-dark mt-2">
            {t.name}
          </h6>
          <span className="text-caption bg-nupul-yellow border-2 border-nupul-dark px-2 py-0.5 rounded-full font-black">
            {t.tag}
          </span>
          <p className="text-caption text-nupul-dark/60 mt-2">
            点击进入绘制工坊 →
          </p>
        </button>
      ))}
    </div>
  </div>
);

/* ── 画布：发布向导 ── */
export const PublishWizardPanel: React.FC<{
  step: number;
  onStep: (n: number) => void;
  author: string;
}> = ({ step, onStep, author }) => {
  const steps = ["确认署名", "填写日记", "预览作品", "提交审批"];
  return (
    <div className="space-y-4">
      <PageBreadcrumb segments={["智能设色", "发布向导", steps[step]]} />
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onStep(i)}
            className={`flex-1 text-caption font-bold py-2 rounded-lg border-2 cursor-pointer ${
              step === i
                ? "bg-nupul-green border-nupul-dark"
                : "bg-white border-nupul-dark/20"
            }`}
          >
            {i + 1}.{s}
          </button>
        ))}
      </div>
      <InfoPanel title={steps[step]}>
        {step === 0 && (
          <p className="text-caption">
            署名：<strong>{author || "未填写"}</strong>
          </p>
        )}
        {step === 1 && (
          <textarea
            className="w-full border-2 border-nupul-dark rounded-xl p-2 text-caption min-h-[80px]"
            placeholder="写下你的自豪感日记…"
            readOnly
          />
        )}
        {step === 2 && (
          <p className="text-caption text-nupul-dark/70">
            系统将把你的设色稿导出为 PNG 并上传至学校展厅。
          </p>
        )}
        {step === 3 && (
          <p className="text-caption text-nupul-green-dark font-bold">
            提交后等待徐老师审批，通过即可在画廊展出。
          </p>
        )}
      </InfoPanel>
    </div>
  );
};

/* ── 问答：主题库 ── */
export const ChatTopicsPanel: React.FC<{ onPick: (q: string) => void }> = ({
  onPick,
}) => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["小草伴读", "主题探索库"]} />
    {[
      {
        cat: "色彩",
        items: ["什么是大理蓝白搭配？", "石青和扎染蓝有什么区别？"],
      },
      { cat: "纹样", items: ["牡丹纹代表什么？", "蝴蝶纹为什么常见？"] },
      { cat: "家风", items: ["清白传家是谁的故事？", "照壁上的字怎么写？"] },
    ].map((block) => (
      <div
        key={block.cat}
        className="bg-nupul-cream border-2 border-nupul-dark rounded-xl p-3"
      >
        <span className="text-caption font-black text-nupul-green-dark">
          {block.cat}
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {block.items.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPick(q)}
              className="text-caption font-bold bg-white border-2 border-nupul-dark px-2.5 py-1.5 rounded-full hover:bg-nupul-yellow cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ── 问答：白语小课堂 ── */
export const BaiLessonPanel: React.FC = () => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["小草伴读", "白语小课堂"]} />
    {[
      { word: "Da xif", meaning: "吉祥、恭喜", example: "画得好 → Da xif！" },
      { word: "Bailizi", meaning: "白族人", example: "我们是 Bailizi" },
      { word: "Hei mo", meaning: "很好", example: "这颜色 Hei mo" },
    ].map((w) => (
      <div
        key={w.word}
        className="bg-white border-3 border-nupul-dark rounded-2xl p-4"
      >
        <span className="text-display-sm font-mono font-black text-[#1a365d]">
          {w.word}
        </span>
        <p className="text-caption font-bold text-nupul-dark mt-1">
          {w.meaning}
        </p>
        <p className="text-caption text-nupul-dark/60 mt-1">例句：{w.example}</p>
      </div>
    ))}
  </div>
);

/* ── 问答：自豪感日记本 ── */
export const PrideJournalPanel: React.FC = () => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["小草伴读", "自豪感日记本"]} />
    <InfoPanel title="我的文化成长记录">
      <ul className="space-y-2 text-caption text-nupul-dark/85">
        <li>6月2日：第一次认识「清白传家」</li>
        <li>6月3日：用石青给牡丹上色</li>
        <li>6月4日：向小草学会了 Da xif</li>
      </ul>
    </InfoPanel>
  </div>
);

/* ── 画廊：作品详情 ── */
export const GalleryDetailPanel: React.FC<{
  work: StudentArtwork | null;
  quad: string;
  onQuad: (id: string) => void;
  onBack?: () => void;
}> = ({ work, quad, onQuad, onBack }) => {
  const quads: Array<{ id: string; label: string; icon: NupulIconName }> = [
    { id: "view", label: "作品欣赏", icon: "favorites" },
    { id: "diary", label: "创作日记", icon: "course" },
    { id: "comments", label: "同学留言", icon: "messages" },
  ];
  if (!work) {
    return (
      <p className="text-center text-caption text-nupul-dark/60 py-8">
        请从展厅选择一幅作品
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-caption font-bold text-nupul-dark/70 hover:text-nupul-orange transition cursor-pointer"
        >
          <BackButtonLabel label="返回展厅大厅" />
        </button>
      )}
      <PageBreadcrumb segments={["数智画廊", work.title]} />
      <SubPageNav
        items={quads}
        active={quad}
        onChange={onQuad}
        level="quaternary"
      />
      <div className="relative overflow-hidden rounded-2xl border-3 border-nupul-dark">
        {renderDiffuseAccents(DIFFUSE_PRESETS.galleryCard)}
        <img
          src={work.imageUrl}
          alt={work.title}
          className="vector-illustration relative z-10 w-full aspect-video object-cover"
        />
      </div>
      {quad === "view" && (
        <div className="flex flex-wrap gap-2">
          {work.tags.map((t) => (
            <span
              key={t}
              className="text-caption bg-nupul-dark/5 px-2 py-0.5 rounded-full border border-nupul-dark/15 font-bold"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      {quad === "diary" && (
        <p className="text-secondary italic text-nupul-dark">“{work.diary}”</p>
      )}
      {quad === "comments" && (
        <div className="space-y-2">
          {["画得太美了！", "石青配色真像洱海"].map((c, i) => (
            <div
              key={i}
              className="bg-nupul-cream border-2 border-nupul-dark/20 rounded-xl p-2 text-caption"
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── 画廊：我的投稿 ── */
export const MySubmissionsPanel: React.FC<{
  works: StudentArtwork[];
  loading?: boolean;
  showPendingBanner?: boolean;
  onDismissBanner?: () => void;
}> = ({ works, loading, showPendingBanner, onDismissBanner }) => {
  const pending = works.filter((w) => !w.approved);
  const approved = works.filter((w) => w.approved);

  return (
    <div className="space-y-4">
      <PageBreadcrumb segments={["作品展示", "我的故事卡"]} />

      {showPendingBanner && pending.length > 0 && (
        <div className="bg-nupul-yellow/40 border-2 border-nupul-dark rounded-2xl px-4 py-3 flex items-start justify-between gap-3">
          <p className="text-caption font-bold text-nupul-dark leading-relaxed">
            作品已提交！徐老师审批通过后，会在「展厅大厅」展出。
          </p>
          {onDismissBanner && (
            <button
              type="button"
              onClick={onDismissBanner}
              className="text-caption font-bold text-nupul-dark/50 hover:text-nupul-dark shrink-0 cursor-pointer"
            >
              知道了
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <StatChip
          label="待审批"
          value={loading ? "…" : `${pending.length} 幅`}
        />
        <StatChip
          label="已展出"
          value={loading ? "…" : `${approved.length} 幅`}
        />
      </div>

      {loading ? (
        <p className="text-caption text-nupul-dark/60 text-center py-6">
          正在加载投稿记录…
        </p>
      ) : works.length === 0 ? (
        <InfoPanel title="还没有投稿">
          <p className="text-caption text-nupul-dark/70 leading-relaxed">
            在「绘制：智能设色」完成作品后，点击「一键发布学校展厅」即可在这里查看审批进度。
          </p>
        </InfoPanel>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <div
              key={work.id}
              className="bg-white border-3 border-nupul-dark rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
            >
              {work.imageUrl ? (
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full sm:w-28 h-20 object-cover rounded-xl border-2 border-nupul-dark/20 shrink-0"
                />
              ) : (
                <div className="w-full sm:w-28 h-20 rounded-xl border-2 border-dashed border-nupul-dark/25 bg-nupul-cream flex items-center justify-center shrink-0">
                  <span className="text-caption font-bold text-nupul-dark/40">
                    设色稿
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-secondary font-bold text-nupul-dark truncate">
                  {work.title}
                </p>
                <p className="text-caption text-nupul-dark/60 mt-1">
                  {work.date}
                </p>
                <span
                  className={`inline-block mt-2 text-caption font-bold px-2.5 py-0.5 rounded-full border-2 border-nupul-dark ${
                    work.approved
                      ? "bg-nupul-green text-white"
                      : "bg-nupul-orange/20 text-nupul-dark"
                  }`}
                >
                  {work.approved
                    ? work.badge || "已展出"
                    : "待徐老师审批"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── 画廊：班级排行榜 ── */
export const ClassRankPanel: React.FC = () => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["数智画廊", "班级排行榜"]} />
    {[
      { name: "杨一诺", score: 96, works: 6 },
      { name: "张宇涵", score: 94, works: 5 },
      { name: "季雨桐", score: 91, works: 4 },
    ].map((r, i) => (
      <div
        key={r.name}
        className={`flex items-center justify-between p-3 rounded-xl border-3 border-nupul-dark ${
          i === 0 ? "bg-nupul-yellow" : "bg-white"
        }`}
      >
        <span className="text-caption font-bold">
          {i + 1}. {r.name}
        </span>
        <span className="text-caption font-bold text-nupul-green-dark">
          {r.score}分 · {r.works}幅
        </span>
      </div>
    ))}
  </div>
);
