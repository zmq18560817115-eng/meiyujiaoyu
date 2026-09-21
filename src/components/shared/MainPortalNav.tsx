import React, { useEffect, useRef, useState } from "react";
import { NavTabBar, NavTabButton } from "../ui/NavTab";
import { NavIconLabel } from "../icons";

export type TeacherMainTab = "home" | "lessons" | "resources" | "works";
export type TeacherQuickTarget =
  | "story"
  | "motif"
  | "color"
  | "craft"
  | "custom"
  | "whiteboard"
  | "panorama"
  | "qa";
export type StudentMainTab = "view3d" | "canvas" | "gallery";

interface TeacherMainNavProps {
  activeTab: TeacherMainTab;
  onChange: (tab: TeacherMainTab) => void;
  onQuickNavigate?: (target: TeacherQuickTarget) => void;
  pendingWorks?: number;
}

export const TeacherMainNav: React.FC<TeacherMainNavProps> = ({
  activeTab,
  onChange,
  onQuickNavigate,
  pendingWorks = 0,
}) => {
  const [lessonMenuOpen, setLessonMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const quickItems: Array<{ target: TeacherQuickTarget; label: string; desc: string }> = [
    { target: "story", label: "照壁故事课", desc: "10个故事课件" },
    { target: "motif", label: "纹样课", desc: "传统纹样专题" },
    { target: "color", label: "色彩课", desc: "白族配色专题" },
    { target: "craft", label: "工艺课", desc: "营造与彩绘工艺" },
    { target: "custom", label: "自定义备课", desc: "按年级与目标生成" },
    { target: "whiteboard", label: "智慧白板", desc: "板书、共创与点评" },
    { target: "panorama", label: "3D全景鉴赏", desc: "照壁漫游与投屏" },
    { target: "qa", label: "智慧问答", desc: "连续追问教学难点" },
  ];

  useEffect(() => {
    const closeWhenOutside = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setLessonMenuOpen(false);
    };
    document.addEventListener("mousedown", closeWhenOutside);
    return () => document.removeEventListener("mousedown", closeWhenOutside);
  }, []);

  const chooseQuickTarget = (target: TeacherQuickTarget) => {
    onQuickNavigate?.(target);
    setLessonMenuOpen(false);
  };

  return (
  <div ref={navRef} className="relative w-full">
  <NavTabBar prominent fullWidth className="w-full">
    <NavTabButton
      active={activeTab === "home"}
      onClick={() => onChange("home")}
      size="md"
      stretch
    >
      <NavIconLabel icon="home">首页</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "lessons"}
      onClick={() => setLessonMenuOpen((open) => !open)}
      size="md"
      stretch
      aria-expanded={lessonMenuOpen}
      aria-haspopup="menu"
    >
      <NavIconLabel icon="course">AI备课 {lessonMenuOpen ? "⌃" : "⌄"}</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "resources"}
      onClick={() => onChange("resources")}
      size="md"
      stretch
    >
      <NavIconLabel icon="pattern">照壁故事素材</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "works"}
      onClick={() => onChange("works")}
      size="md"
      stretch
    >
      <NavIconLabel icon="favorites">作品批改 ({pendingWorks})</NavIconLabel>
    </NavTabButton>
  </NavTabBar>
  {lessonMenuOpen && (
    <div
      role="menu"
      aria-label="AI备课快捷入口"
      className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[80] rounded-3xl border-3 border-nupul-dark bg-white p-3 shadow-[0_18px_45px_rgba(45,36,16,0.22)]"
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <div>
          <p className="text-caption font-black text-nupul-dark">AI备课快捷入口</p>
          <p className="text-[10px] font-semibold text-nupul-dark/55">选择功能后直接定位，当前页面不会被遮盖</p>
        </div>
        <button type="button" onClick={() => setLessonMenuOpen(false)} className="text-caption font-bold underline cursor-pointer">收起</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickItems.map((item) => (
          <button
            key={item.target}
            type="button"
            role="menuitem"
            onClick={() => chooseQuickTarget(item.target)}
            className="rounded-2xl border-2 border-nupul-dark bg-nupul-cream px-3 py-2.5 text-left hover:bg-nupul-yellow transition cursor-pointer"
          >
            <span className="block text-caption font-black text-nupul-dark">{item.label}</span>
            <span className="mt-0.5 block text-[10px] font-semibold text-nupul-dark/55">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )}
  </div>
  );
};

interface StudentMainNavProps {
  activeTab: StudentMainTab;
  onChange: (tab: StudentMainTab) => void;
}

export const StudentMainNav: React.FC<StudentMainNavProps> = ({
  activeTab,
  onChange,
}) => (
  <NavTabBar prominent fullWidth className="w-full">
    <NavTabButton
      active={activeTab === "view3d"}
      onClick={() => onChange("view3d")}
      size="md"
      stretch
    >
      <NavIconLabel icon="cube">3D鉴赏</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "canvas"}
      onClick={() => onChange("canvas")}
      size="md"
      stretch
    >
      <NavIconLabel icon="brush">智慧绘画</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "gallery"}
      onClick={() => onChange("gallery")}
      size="md"
      stretch
    >
      <NavIconLabel icon="palette">作品展示</NavIconLabel>
    </NavTabButton>
  </NavTabBar>
);
