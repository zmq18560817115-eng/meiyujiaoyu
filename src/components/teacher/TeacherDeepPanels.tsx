import React, { useRef } from "react";
import { motion } from "motion/react";
import { useResourceCache } from "../../context/ResourceCacheContext";
import {
  SubPageNav,
  PageBreadcrumb,
  InfoPanel,
  StatChip,
} from "../shared/SubPageNav";
import { BackButtonLabel, type NupulIconName } from "../icons";
import { NupulSelect } from "../ui/NupulSelect";
import type {
  Course,
  Resource,
  StudentArtwork,
  Announcement,
  ScheduleItem,
} from "../../types";

export const ScheduleDetailPanel: React.FC<{ schedules: ScheduleItem[] }> = ({
  schedules,
}) => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["工作台", "今日课表详情"]} />
    {schedules.map((s) => (
      <div
        key={s.id}
        className="bg-nupul-cream border-3 border-nupul-dark rounded-2xl p-4"
      >
        <span className="text-caption font-black text-nupul-green-dark">
          {s.time}
        </span>
        <h6 className="text-secondary font-bold text-nupul-dark mt-1">
          {s.title}
        </h6>
        <p className="text-caption text-nupul-dark/75 mt-1">
          {s.className} · {s.note}
        </p>
        <button
          type="button"
          className="mt-2 text-caption font-black text-nupul-dark underline cursor-pointer"
        >
          进入备课 →
        </button>
      </div>
    ))}
  </div>
);

export const NoticesDetailPanel: React.FC<{
  announcements: Announcement[];
}> = ({ announcements }) => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["工作台", "校园公告详情"]} />
    {announcements.map((a) => (
      <div
        key={a.id}
        className="bg-white border-2 border-nupul-dark rounded-xl p-3"
      >
        <span className="text-caption text-nupul-orange font-mono">
          {a.date} · {a.src}
        </span>
        <p className="text-caption font-bold text-nupul-dark mt-1">{a.title}</p>
      </div>
    ))}
  </div>
);

/* ── 3D 教学四级 ── */
export const Teach3DScriptPanel: React.FC<{ hotspotId: string }> = ({
  hotspotId,
}) => (
  <InfoPanel title="课堂讲解脚本（自动生成）">
    <p className="text-caption leading-relaxed text-nupul-dark/85">
      同学们，请看
      {hotspotId === "gate" ? "门楼" : hotspotId === "roof" ? "飞檐" : "照壁"}
      位置。 白族彩绘不仅好看，每一道线条都在讲述耕读传家、吉祥平安的故事……
    </p>
  </InfoPanel>
);

export const ProjectionControlPanel: React.FC<{
  active: boolean;
  onToggle: () => void;
  hotspotId: string;
}> = ({ active, onToggle, hotspotId }) => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["3D课堂", "投屏控制"]} />
    <StatChip
      label="投屏状态"
      value={active ? "已开启" : "未开启"}
    />
    <button
      type="button"
      onClick={onToggle}
      className="w-full nupul-pill-btn-green py-3 text-caption font-black cursor-pointer"
    >
      {active ? "关闭全班投屏" : "开启全班投屏"}
    </button>
  </div>
);

/* ── 白板四级 ── */
export const WhiteboardNotesListPanel: React.FC<{
  notes: Array<{ id: string; text: string; author: string; color: string }>;
}> = ({ notes }) => (
  <div className="space-y-2 max-h-[280px] overflow-y-auto">
    <PageBreadcrumb segments={["智慧白板", "灵感帖列表"]} />
    {notes.map((n) => (
      <div
        key={n.id}
        className="border-2 border-nupul-dark rounded-xl p-2 text-caption"
        style={{ backgroundColor: n.color }}
      >
        <span className="font-black">{n.author}</span>：{n.text}
      </div>
    ))}
  </div>
);

/* ── 课程：详情 ── */
export const CourseDetailPanel: React.FC<{ course: Course | null }> = ({
  course,
}) => {
  if (!course) {
    return (
      <p className="text-caption text-center py-8 text-nupul-dark/60">
        点击左侧课程卡片查看详情
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <PageBreadcrumb segments={["微课备课", "课程详情", course.title]} />
      <InfoPanel title={course.title}>
        <p className="text-caption text-nupul-dark/80">{course.desc}</p>
        <p className="text-caption mt-2 font-bold">
          ⏱ {course.duration} · {course.difficulty}
        </p>
        <ul className="mt-3 space-y-1">
          {course.outline.map((o, i) => (
            <li key={i} className="text-caption">
              {o}
            </li>
          ))}
        </ul>
      </InfoPanel>
    </div>
  );
};

/* ── 课程：开课_session ── */
export const ClassSessionPanel: React.FC = () => (
  <div className="space-y-4">
    <PageBreadcrumb segments={["微课备课", "开课助手"]} />
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        className="nupul-pill-btn-yellow py-4 text-caption font-black cursor-pointer"
      >
        启动 3D 全景
      </button>
      <button
        type="button"
        className="nupul-pill-btn-green py-4 text-caption font-black cursor-pointer"
      >
        打开智能白板
      </button>
      <button
        type="button"
        className="bg-white border-3 border-nupul-dark py-4 rounded-2xl text-caption font-black cursor-pointer"
      >
        推送设色任务
      </button>
      <button
        type="button"
        className="bg-white border-3 border-nupul-dark py-4 rounded-2xl text-caption font-black cursor-pointer"
      >
        开启作品收集
      </button>
    </div>
  </div>
);

/* ── 资源：预览（资源列表「预览」的下一级界面） ── */
export const ResourcePreviewPanel: React.FC<{
  resource: Resource | null;
  onBack: () => void;
}> = ({ resource, onBack }) => {
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const { downloadToLocal } = useResourceCache();

  if (!resource) return null;

  const handleDownload = () => {
    const el = downloadBtnRef.current;
    if (!el) return;
    downloadToLocal(resource, el);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 pb-3 border-b-2 border-nupul-dark/10">
        <button
          type="button"
          onClick={onBack}
          className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
        >
          <BackButtonLabel label="返回资源浏览" />
        </button>
        <PageBreadcrumb segments={["资源浏览", "资源预览"]} />
      </div>
      <InfoPanel title={resource.title}>
        <div className="grid grid-cols-2 gap-2 text-caption">
          <StatChip label="类型" value={resource.fileType.toUpperCase()} />
          <StatChip label="大小" value={resource.size} />
          <StatChip label="下载" value={`${resource.downloads} 次`} />
          <StatChip label="入库" value={resource.date} />
        </div>
        <button
          ref={downloadBtnRef}
          type="button"
          onClick={handleDownload}
          className="w-full mt-2 nupul-pill-btn-green py-2 text-caption font-black cursor-pointer"
        >
          下载到本地
        </button>
      </InfoPanel>
    </div>
  );
};

function PlatformSyncArrowButton({ label }: { label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={`同步 ${label}`}
      whileTap={{ scale: 0.9, x: 5 }}
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      className="flex items-center justify-center w-10 h-10 p-0 bg-transparent border-0 cursor-pointer text-nupul-dark/55 hover:text-nupul-dark"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-8 h-8"
        aria-hidden
      >
        <path
          d="M7 12h11M13 8l5 4-5 4"
          stroke="currentColor"
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

export const PlatformSyncPanel: React.FC = () => (
  <div className="space-y-3">
    <PageBreadcrumb segments={["资源库", "平台同步"]} />
    {["国家数字平台", "特色核心库", "校本库"].map((p) => (
      <div
        key={p}
        className="flex justify-between items-center bg-white border-2 border-nupul-dark rounded-xl p-3"
      >
        <span className="text-caption font-black">{p}</span>
        <PlatformSyncArrowButton label={p} />
      </div>
    ))}
  </div>
);

const UPLOAD_FORMATS = [
  { id: "pdf", label: "PDF 幻灯片" },
  { id: "mp4", label: "课堂录像" },
  { id: "mp3", label: "伴读音频" },
  { id: "svg", label: "矢量纹样" },
] as const;

const fieldClass =
  "w-full bg-white/90 border-2 border-nupul-dark/20 rounded-xl py-2.5 px-3.5 text-caption font-semibold text-nupul-dark focus:outline-none focus:border-nupul-dark/45 focus:bg-white placeholder-nupul-dark/35 transition";

export const LocalUploadPanel: React.FC<{
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onTitleChange: (value: string) => void;
  resType: string;
  onResTypeChange: (value: string) => void;
  fileType: string;
  onFileTypeChange: (value: string) => void;
  successMsg: boolean;
}> = ({
  onBack,
  onSubmit,
  title,
  onTitleChange,
  resType,
  onResTypeChange,
  fileType,
  onFileTypeChange,
  successMsg,
}) => (
  <div className="space-y-5">
    <div className="space-y-2 pb-3 border-b-2 border-nupul-dark/10">
      <button
        type="button"
        onClick={onBack}
        className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
      >
        <BackButtonLabel label="返回资源浏览" />
      </button>
      <PageBreadcrumb segments={["资源浏览", "快速上传", "本地上传"]} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <form
        onSubmit={onSubmit}
        className="lg:col-span-7 flex flex-col gap-4"
      >
        <p className="text-caption text-nupul-dark/70 font-semibold leading-relaxed">
          支持将平时随堂拍摄的孩子们手工成品、课件图稿上传到本地库，归档后可在资源浏览中预览与调用。
        </p>

        <div className="rounded-2xl lg:rounded-3xl bg-white p-5 sm:p-6 space-y-5 border-2 border-nupul-dark">
          <div>
            <label className="block text-caption font-bold text-nupul-dark/80 mb-2">
              物料资源名称
            </label>
            <input
              type="text"
              required
              className={fieldClass}
              placeholder="例如：蝴蝶泉实拍、严家大院瓦件"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-bold text-nupul-dark/80 mb-2">
                归档目录
              </label>
              <NupulSelect
                aria-label="归档目录"
                value={resType}
                onChange={onResTypeChange}
                options={[
                  { value: "local", label: "本地特色学校库" },
                  { value: "core", label: "白族非遗古物本校库" },
                ]}
              />
            </div>
            <div>
              <label className="block text-caption font-bold text-nupul-dark/80 mb-2">
                媒体格式
              </label>
              <NupulSelect
                aria-label="媒体格式"
                value={fileType}
                onChange={onFileTypeChange}
                options={[
                  { value: "pdf", label: "课件 PDF 幻灯片" },
                  { value: "mp4", label: "视频录像 MP4" },
                  { value: "mp3", label: "大理话伴读音频 MP3" },
                  { value: "svg", label: "传统矢量图案 SVG" },
                ]}
              />
            </div>
          </div>

          {successMsg && (
            <p className="text-caption text-nupul-green-dark font-bold animate-pulse">
              随堂物料资源归档保存成功！
            </p>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto sm:min-w-[14rem] nupul-pill-btn-yellow py-2.5 px-6 text-caption font-bold cursor-pointer"
          >
            确认添加进非遗数字库
          </button>
        </div>
      </form>

      <aside className="lg:col-span-5 flex flex-col gap-5 lg:pt-1">
        <div className="space-y-3">
          <h5 className="text-secondary font-bold text-nupul-dark">
            存储空间
          </h5>
          <div className="flex justify-between text-caption font-bold text-nupul-dark/55">
            <span>已用数字存储空间</span>
            <span className="tabular-nums">1.26 GB / 5.0 GB</span>
          </div>
          <div className="w-full bg-nupul-dark/8 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-nupul-yellow h-full rounded-full transition-all"
              style={{ width: "25.2%" }}
            />
          </div>
          <p className="text-caption text-nupul-green-dark font-semibold leading-relaxed">
            人机共存断网应急技术：学校本地环境支持一键无网安全备课展示。
          </p>
        </div>

        <div className="pt-4 border-t border-dashed border-nupul-dark/15 space-y-3">
          <h5 className="text-secondary font-bold text-nupul-dark">
            支持归档格式
          </h5>
          <div className="flex flex-wrap gap-2">
            {UPLOAD_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onFileTypeChange(fmt.id)}
                className={`text-caption font-bold px-3 py-1 rounded-full border-2 cursor-pointer transition ${
                  fileType === fmt.id
                    ? "bg-nupul-green text-nupul-dark border-nupul-dark"
                    : "bg-white/70 text-nupul-dark/70 border-nupul-dark/20 hover:border-nupul-dark/40"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  </div>
);

export const ExportReportPanel: React.FC<{
  pending: number;
  total: number;
}> = ({ pending, total }) => {
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  const { exportWeeklyReportToLocal } = useResourceCache();

  const handleExport = () => {
    const el = exportBtnRef.current;
    if (!el) return;
    exportWeeklyReportToLocal({ pending, total }, el);
  };

  return (
    <InfoPanel title="班级美育周报">
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="总作品" value={`${total} 份`} />
        <StatChip label="待审批" value={`${pending} 份`} />
      </div>
      <button
        ref={exportBtnRef}
        type="button"
        onClick={handleExport}
        className="w-full mt-3 nupul-pill-btn-green py-2.5 text-caption font-black cursor-pointer"
      >
        导出 PDF 周报
      </button>
    </InfoPanel>
  );
};

export const WorkReviewDetailPanel: React.FC<{
  work: StudentArtwork | null;
  quad: string;
  onQuad: (id: string) => void;
  onBack: () => void;
  isApproved?: boolean;
  badges?: string[];
  selectedBadge?: string;
  onBadgeChange?: (badge: string) => void;
  onApprove?: () => void;
  onUnpublish?: () => void;
}> = ({
  work,
  quad,
  onQuad,
  onBack,
  isApproved = false,
  badges = [],
  selectedBadge = "",
  onBadgeChange,
  onApprove,
  onUnpublish,
}) => {
  const quads = [
    { id: "preview", label: "作品预览", icon: "pattern" as NupulIconName },
    { id: "diary", label: "日记批阅", icon: "course" as NupulIconName },
  ];
  const badgeOptions = [
    { value: "", label: "-- 选择奖励勋章 --" },
    ...badges.map((b) => ({ value: b, label: b })),
  ];
  if (!work) return null;

  return (
    <div className="space-y-5">
      <div className="space-y-2 pb-3 border-b-2 border-nupul-dark/10">
        <button
          type="button"
          onClick={onBack}
          className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
        >
          <BackButtonLabel label="返回待审列表" />
        </button>
        <PageBreadcrumb segments={["待审列表", "深度批阅", work.studentName]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-4 aspect-video rounded-xl bg-slate-100 overflow-hidden border-2 border-nupul-dark">
          <img
            src={work.imageUrl}
            alt={work.title}
            className="vector-illustration w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="md:col-span-8 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-caption font-bold rounded-full border-2 px-2.5 py-0.5 leading-none ${
                isApproved
                  ? "bg-nupul-cream text-nupul-dark/50 border-nupul-dark/20"
                  : "bg-nupul-yellow text-nupul-dark border-nupul-dark"
              }`}
            >
              {isApproved ? "已推报线上长廊" : "等待推报"}
            </span>
            <span className="text-caption font-bold text-nupul-green-dark bg-[#eefbf0] border border-nupul-green-dark/20 px-2 py-0.5 rounded">
              {work.grade} // {work.studentName} 同学
            </span>
          </div>
          <h5 className="text-secondary font-bold text-nupul-dark">{work.title}</h5>
          <p className="text-caption text-nupul-dark/80 bg-nupul-cream/60 p-2.5 rounded-xl border-2 border-stone-800/5 leading-relaxed font-medium italic">
            <strong>学习日记:</strong> “{work.diary}”
          </p>
          {isApproved ? (
            <div className="pt-2 space-y-2.5">
              <p className="text-caption font-bold text-nupul-green-dark">
                推报成功 · 所获荣誉：
                {work.badge || selectedBadge || "非物质文化传承之星"}
              </p>
              <button
                type="button"
                onClick={onUnpublish}
                className="w-full p-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-caption font-bold border-2 border-[#c53030] text-[#c53030] transition-all active:translate-y-0.5 cursor-pointer"
              >
                下架作品
              </button>
            </div>
          ) : (
            <div className="pt-2 space-y-2.5">
              <label className="text-caption font-bold text-nupul-dark/60 block">
                选择颁发勋章
              </label>
              <NupulSelect
                value={selectedBadge}
                onChange={(value) => onBadgeChange?.(value)}
                options={badgeOptions}
                aria-label="选择颁发勋章"
              />
              <button
                type="button"
                onClick={onApprove}
                className="w-full nupul-pill-btn-green py-2.5 px-3 text-caption font-bold cursor-pointer"
              >
                推报上展并印制美育长廊
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t-2 border-dashed border-nupul-dark/15 space-y-3">
        <SubPageNav
          items={quads}
          active={quad}
          onChange={onQuad}
          level="quaternary"
        />
        {quad === "preview" && (
          <img
            src={work.imageUrl}
            alt={work.title}
            className="vector-illustration w-full rounded-xl border-3 border-nupul-dark aspect-video object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        {quad === "diary" && (
          <p className="text-secondary italic leading-relaxed">“{work.diary}”</p>
        )}
      </div>
    </div>
  );
};

/* ── 问答四级：非遗智库 ── */
export const HeritageDbPanel: React.FC<{ onPick: (q: string) => void }> = ({
  onPick,
}) => (
  <div className="space-y-2">
    <PageBreadcrumb segments={["智慧问答", "非遗常备智库"]} />
    {[
      "如何讲解照壁光影？",
      "蝴蝶纹备课要点",
      "零基础设色示范",
      "如何引导自豪感日记",
    ].map((q) => (
      <button
        key={q}
        type="button"
        onClick={() => onPick(q)}
        className="w-full text-left text-caption font-bold bg-nupul-cream border-2 border-nupul-dark rounded-xl p-3 hover:bg-nupul-yellow/30 cursor-pointer"
      >
        {q}
      </button>
    ))}
  </div>
);

export const AssessmentTipsPanel: React.FC = () => (
  <InfoPanel title="美育过程性评价量表">
    <ul className="text-caption space-y-2 text-nupul-dark/85">
      <li>① 纹样识别准确度（30%）</li>
      <li>② 传统配色合理性（30%）</li>
      <li>③ 自豪感日记表达（25%）</li>
      <li>④ 课堂互动参与（15%）</li>
    </ul>
  </InfoPanel>
);
