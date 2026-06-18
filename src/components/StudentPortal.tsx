import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StudentArtwork, PanoramaHotspot } from "../types";
import { PanoramaLessonPanel } from "./shared/PanoramaLessonPanel";
import {
  PanoramaTourViewport,
  getPanoramaView,
} from "./shared/PanoramaTourViewport";
import {
  viewIdFromSyncId,
  type PanoramaViewId,
} from "../data/panoramaViews";
import { InkBleedLoader } from "./InkBleedLoader";
import { api } from "../api/client";
import { pickRandomPattern, type ColoringPattern } from "../data/coloringPatterns";
import { useProjectionSync } from "../hooks/useProjectionSync";
import {
  PatternColoringBoard,
  type PatternColoringBoardHandle,
} from "./student/PatternColoringBoard";
import {
  FreeDrawBoard,
  type FreeDrawBoardHandle,
} from "./student/FreeDrawBoard";
import { SubPageNav } from "./shared/SubPageNav";
import type { StudentMainTab } from "./shared/MainPortalNav";
import {
  GalleryDetailPanel,
  MySubmissionsPanel,
  ClassRankPanel,
} from "./student/StudentDeepPanels";
import {
  DIFFUSE_PRESETS,
  renderDiffuseAccents,
} from "./ui/DiffuseDecor";
import {
  STUDENT_3D_MODULES,
  STUDENT_GALLERY_MODULES,
} from "../data/portalFramework";
import { InfoPanel } from "./shared/SubPageNav";

interface StudentPortalProps {
  activeTab: StudentMainTab;
  onActiveTabChange: (tab: StudentMainTab) => void;
  galleryWorks: StudentArtwork[];
  studentProfile: { name: string; grade: string } | null;
  onRefreshGallery: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  activeTab,
  onActiveTabChange,
  galleryWorks,
  studentProfile,
  onRefreshGallery,
}) => {
  const patternBoardRef = useRef<PatternColoringBoardHandle>(null);
  const freeDrawBoardRef = useRef<FreeDrawBoardHandle>(null);
  const [canvasMode, setCanvasMode] = useState<"pattern" | "free">("pattern");
  const { projection, setProjection } = useProjectionSync("student", {
    studentName: studentProfile?.name,
  });
  const [sub3d, setSub3d] = useState("map");
  const [subGallery, setSubGallery] = useState("hall");
  const [galleryQuad, setGalleryQuad] = useState("view");
  const [selectedGalleryWork, setSelectedGalleryWork] =
    useState<StudentArtwork | null>(null);
  const [mySubmissions, setMySubmissions] = useState<StudentArtwork[]>([]);
  const [mySubmissionsLoading, setMySubmissionsLoading] = useState(false);
  const [publishPendingNotice, setPublishPendingNotice] = useState(false);

  const switchStudentTab = (tab: StudentMainTab) => {
    onActiveTabChange(tab);
    setSub3d("map");
    setSubGallery("hall");
    setGalleryQuad("view");
  };
  const [isInkBleeding, setIsInkBleeding] = useState(false);
  const [localGallery, setLocalGallery] =
    useState<StudentArtwork[]>(galleryWorks);
  useEffect(() => {
    setLocalGallery(galleryWorks);
  }, [galleryWorks]);

  useEffect(() => {
    if (studentProfile) {
      setPublishAuthor(studentProfile.name);
    }
  }, [studentProfile]);

  const refreshMySubmissions = useCallback(async () => {
    if (!studentProfile?.name) return;
    setMySubmissionsLoading(true);
    try {
      const { artworks } = await api.artworks.list();
      setMySubmissions(
        artworks.filter((w) => w.studentName === studentProfile.name),
      );
    } catch (e) {
      console.error("投稿列表加载失败", e);
    } finally {
      setMySubmissionsLoading(false);
    }
  }, [studentProfile?.name]);

  useEffect(() => {
    if (studentProfile) refreshMySubmissions();
  }, [studentProfile, refreshMySubmissions]);

  useEffect(() => {
    if (activeTab === "gallery" && subGallery === "mine") {
      refreshMySubmissions();
    }
  }, [activeTab, subGallery, refreshMySubmissions]);

  // -------------------------------------------------------------
  // 1. 3D Panoramic Appreciation State
  // -------------------------------------------------------------
  const [selectedPanoramaView, setSelectedPanoramaView] =
    useState<PanoramaViewId>("overview");
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>("gate");
  const activePanorama = getPanoramaView(selectedPanoramaView);

  useEffect(() => {
    if (projection.active && projection.hotspotId) {
      setSelectedHotspot(projection.hotspotId);
      setSelectedPanoramaView(viewIdFromSyncId(projection.hotspotId));
    }
  }, [projection.active, projection.hotspotId]);
  const [hotspots, setHotspots] = useState<PanoramaHotspot[]>([]);

  useEffect(() => {
    api.panorama
      .hotspots()
      .then((data) => {
        setHotspots(data.hotspots);
        if (data.hotspots.length > 0) {
          const syncId = data.hotspots[1]?.id || data.hotspots[0].id;
          setSelectedHotspot(syncId);
          setSelectedPanoramaView(viewIdFromSyncId(syncId));
        }
      })
      .catch(() => {
        setHotspots([
          {
            id: "roof",
            x: "50%",
            y: "15%",
            title: "高悬飞檐与斗拱彩绘",
            bilingual: "Roof Eaves",
            desc: "飞檐斗拱彩绘…",
          },
          {
            id: "gate",
            x: "50%",
            y: "45%",
            title: "一门两窗与“清白”门头",
            bilingual: "Main Entrance",
            desc: "牌楼式大门…",
          },
          {
            id: "wall",
            x: "15%",
            y: "60%",
            title: "‘清白传家’照壁水墨",
            bilingual: "Reflections Wall",
            desc: "照壁水墨…",
          },
        ]);
      });
    api.bootstrap
      .student()
      .then((boot) => {
        if (boot.projection?.hotspotId) {
          setProjection({
            hotspotId: boot.projection.hotspotId,
            active: boot.projection.active ?? false,
            updatedAt: boot.projection.updatedAt,
          });
        }
      })
      .catch(() => {});
  }, [setProjection]);

  // -------------------------------------------------------------
  // 2. Smart Coloring Canvas State
  // -------------------------------------------------------------
  const [activePattern, setActivePattern] = useState<ColoringPattern>(() =>
    pickRandomPattern(),
  );
  const [selectedColor, setSelectedColor] = useState<string>("#1a365d"); // Default 石青 Dali indigo
  const [colorName, setColorName] = useState<string>("石青 (Dali Indigo Blue)");
  const [colorTab, setColorTab] = useState<"heritage" | "custom">("heritage");
  const [customH, setCustomH] = useState<number>(200);
  const [customS, setCustomS] = useState<number>(85);
  const [customL, setCustomL] = useState<number>(50);

  // Helper to sync HSL values with Selected Hex Color
  const updateCustomColorFromHsl = (h: number, s: number, l: number) => {
    const lNorm = l / 100;
    const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    const hex = `#${f(0)}${f(8)}${f(4)}`;
    setSelectedColor(hex);
    setColorName(`自寻灵感色 (${hex.toUpperCase()})`);
  };

  // Color Wheel Pointer Interaction handler (Angles & Radius to select Hue & Saturation)
  const handleColorWheelInteraction = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Calculate angle in degrees (0 to 360)
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Calculate saturation based on radius percentage
    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;
    const sat = Math.round(Math.min(100, (distance / maxRadius) * 100));

    const h = Math.round(angle);
    setCustomH(h);
    setCustomS(sat);
    updateCustomColorFromHsl(h, sat, customL);
  };

  const [publishAuthor, setPublishAuthor] = useState("");
  const [publishDiary, setPublishDiary] = useState("");
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const colors = [
    { name: "石青 (Dali Indigo Blue)", hex: "#1a365d" },
    { name: "朱红 (Vermilion Red)", hex: "#c53030" },
    { name: "蛤白 (Clam Shell White)", hex: "#f7f2ec" },
    { name: "烟墨 (Mineral Charcoal)", hex: "#2d3748" },
    { name: "松石绿 (Turquoise Green)", hex: "#2c7a7b" },
    { name: "金藤黄 (Auspicious Gold)", hex: "#d69e2e" },
    { name: "青白蓝 (Tie-Dye Azure)", hex: "#4285f4" },
    { name: "胭脂红 (Rich Rouge Rose)", hex: "#e05e74" },
    { name: "石绿 (Malachite Green)", hex: "#3d9970" },
    { name: "竹青 (Bale Bamboo Green)", hex: "#2ecc40" },
    { name: "黛紫 (Imperial Plum)", hex: "#5e3b5e" },
    { name: "檀木赭 (Rustic Sienna)", hex: "#8c5225" },
  ];

  const handleResetCanvas = () => {
    if (canvasMode === "pattern") {
      patternBoardRef.current?.clearFills();
    } else {
      freeDrawBoardRef.current?.clear();
    }
    setPublishedSuccess(false);
  };

  const handleShufflePattern = () => {
    setActivePattern((prev) => pickRandomPattern(prev.id));
    handleResetCanvas();
  };

  const handlePublish = () => {
    if (!publishAuthor.trim()) {
      alert("请输入你的名字，署名你的大作！");
      return;
    }
    // Set the state to true to engage the beautiful "Ink Bleed" tie-dye simulation loader!
    setIsInkBleeding(true);
  };

  const handlePublishComplete = async () => {
    try {
      let imageUrl: string | undefined;
      const pngBase64 =
        canvasMode === "pattern"
          ? patternBoardRef.current?.exportPng()
          : freeDrawBoardRef.current?.exportPng();
      if (pngBase64) {
        const uploaded = await api.uploads.base64(
          pngBase64,
          `artwork-${Date.now()}.png`,
        );
        imageUrl = uploaded.url;
      }

      await api.artworks.create({
        studentName: publishAuthor,
        title:
          canvasMode === "pattern"
            ? `青墙粉绘：${activePattern.name}`
            : `自主创作：${publishAuthor.trim() || "我的小画家"}的照壁画`,
        grade: studentProfile?.grade || "双廊小学 创意生",
        imageUrl,
        tags:
          canvasMode === "pattern"
            ? ["数字白画", "人机设色", "大理传统", ...activePattern.tags]
            : ["自主创作", "照壁构想", "大理传统"],
        diary:
          publishDiary ||
          "这是我在青墙粉绘系统的创作。在大理的青砖黛瓦里，画下属于我的颜色和祝福。",
        templateType:
          canvasMode === "pattern" ? activePattern.id : "free-draw",
        artworkData:
          canvasMode === "pattern"
            ? {
                patternId: activePattern.id,
                patternName: activePattern.name,
                selectedColor,
              }
            : {
                mode: "free-draw",
                selectedColor,
              },
        approved: false,
      });
      await onRefreshGallery();
      await refreshMySubmissions();
    } catch (e) {
      console.error(e);
      alert("作品提交失败，请稍后重试");
      setIsInkBleeding(false);
      return;
    }
    setIsInkBleeding(false);
    setPublishedSuccess(true);
    setPublishPendingNotice(true);
    window.setTimeout(() => {
      onActiveTabChange("gallery");
      setSubGallery("mine");
    }, 1500);
  };

  return (
    <div className="ds-page portal-workspace py-2 md:py-3 flex flex-col gap-3 md:gap-4 h-full min-h-0">
      {/* Main interactive viewport container */}
      <div className="nupul-tactile-card portal-workspace-panel bg-white p-3 md:p-4 relative overflow-hidden min-h-0">
        {renderDiffuseAccents(DIFFUSE_PRESETS.mainPanel)}
        <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* Module 1: 3D Panoramic Appraiser */}
          {activeTab === "view3d" && (
            <motion.div
              key="view3d"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <SubPageNav
                items={STUDENT_3D_MODULES}
                active={sub3d}
                onChange={setSub3d}
                className="mb-3 w-full"
              />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start">
                  {/* Left Side: Traditional Architectural Render */}
                  <div className="md:col-span-7 flex flex-col space-y-2 md:space-y-3 min-w-0">
                    <div className="space-y-1.5">
                      <h3 className="text-secondary md:text-display-sm font-bold text-nupul-dark tracking-tight flex flex-wrap items-center gap-2">
                        <span>3D鉴赏 · 照壁故事地图</span>
                        <span className="py-0.5 px-2.5 bg-nupul-yellow text-nupul-dark rounded-full border-2 border-nupul-dark font-bold text-[11px] tracking-wide">
                          多感官交互
                        </span>
                      </h3>
                      {projection.active && (
                        <p className="text-[11px] md:text-caption font-bold text-nupul-green-dark bg-nupul-green/20 border border-nupul-green-dark/30 rounded-lg px-2.5 py-1.5 animate-pulse">
                          老师正在投屏讲解：请跟随视角「{activePanorama.title}」
                        </p>
                      )}
                      <p className="text-[11px] md:text-caption text-nupul-dark/65 font-medium hidden sm:block">
                        点击画面导览点或底部视角按钮，切换白族墙绘多方位环视实景
                      </p>
                    </div>

                    {sub3d !== "ai" && (
                      <PanoramaTourViewport
                        variant="light"
                        compact
                        activeViewId={selectedPanoramaView}
                        onViewChange={(viewId) => {
                          setSelectedPanoramaView(viewId);
                          setSelectedHotspot(
                            getPanoramaView(viewId).syncId,
                          );
                        }}
                        className="w-full"
                        minHeight="min-h-0"
                      />
                    )}
                    {sub3d === "ai" && (
                      <InfoPanel title="AI简短讲解 · 小草伴读">
                        <p className="text-caption text-nupul-dark/85 leading-relaxed font-semibold">
                          {activePanorama.studentNarration}
                        </p>
                        <p className="text-caption text-nupul-dark/55 mt-3 leading-relaxed">
                          {activePanorama.desc}
                        </p>
                      </InfoPanel>
                    )}
                  </div>

                  {sub3d === "zoom" ? (
                    <div className="md:col-span-5 space-y-2 md:max-h-[calc(100dvh-11rem)] md:overflow-y-auto">
                      <InfoPanel title="放大/拆解 · 构件细读">
                        <p className="text-caption text-nupul-dark/85 leading-relaxed">
                          {activePanorama.desc}
                        </p>
                        <p className="text-caption font-bold text-nupul-green-dark mt-3">
                          {activePanorama.lessonTag}
                        </p>
                      </InfoPanel>
                      <PanoramaLessonPanel
                        view={activePanorama}
                        variant="student"
                      />
                    </div>
                  ) : sub3d !== "ai" ? (
                    <PanoramaLessonPanel
                      className="md:col-span-5 md:max-h-[calc(100dvh-11rem)] md:overflow-y-auto"
                      view={activePanorama}
                      variant="student"
                    />
                  ) : null}
                </div>
            </motion.div>
          )}

          {/* Module 2: Smart Coloring Studio (Canvas & Smart AI Guidance) */}
          {activeTab === "canvas" && (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <SubPageNav
                items={[
                  { id: "pattern", label: "非遗纹样填涂", icon: "pattern" },
                  { id: "free", label: "自主创作绘画", icon: "brush" },
                ]}
                active={canvasMode}
                onChange={(id) => setCanvasMode(id as "pattern" | "free")}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
                  {/* Left Canvas Panel: outlining palette/stamps, canvas viewport */}
                  <div className="lg:col-span-12 flex flex-col space-y-3">
                    {canvasMode === "pattern" ? (
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-nupul-cream p-3 rounded-2xl border-2 border-nupul-dark/15">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-caption font-bold text-nupul-dark pr-1">
                          今日纹样:
                        </span>
                        <span className="text-caption px-3.5 py-1.5 rounded-full font-bold border-2 border-nupul-dark bg-nupul-yellow text-nupul-dark">
                          {activePattern.name}
                        </span>
                        <button
                          onClick={handleShufflePattern}
                          className="text-caption px-3.5 py-1.5 rounded-full font-bold border-2 border-nupul-dark bg-white hover:bg-nupul-soft-yellow text-stone-700 transition cursor-pointer"
                        >
                          换一张纹样
                        </button>
                      </div>

                      <button
                        onClick={handleResetCanvas}
                        className="text-caption text-nupul-dark/60 hover:text-nupul-orange flex items-center space-x-1 font-bold cursor-pointer shrink-0"
                      >
                        <span>清空重填</span>
                      </button>
                    </div>
                    ) : (
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-nupul-cream p-3 rounded-2xl border-2 border-nupul-dark/15">
                      <p className="text-caption font-bold text-nupul-dark">
                        空白画纸 · 自由描绘照壁、纹样与家乡故事
                      </p>
                      <button
                        type="button"
                        onClick={handleResetCanvas}
                        className="text-caption text-nupul-dark/60 hover:text-nupul-orange font-bold cursor-pointer shrink-0"
                      >
                        清空画布
                      </button>
                    </div>
                    )}

                    {/* Main Interactive Coloring Box */}
                    <div
                      className={`relative flex-1 bg-nupul-cream rounded-3xl border-3 border-nupul-dark min-h-[420px] overflow-hidden ${
                        canvasMode === "free"
                          ? "p-3 sm:p-4 lg:p-5"
                          : "p-5 sm:p-6 lg:p-8"
                      }`}
                    >
                      {renderDiffuseAccents(DIFFUSE_PRESETS.studio)}
                      <div
                        className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 items-start ${
                          canvasMode === "free"
                            ? "gap-4 lg:gap-5"
                            : "gap-6 lg:gap-8 xl:gap-10"
                        }`}
                      >
                      {/* Color Swatch Menu / Dali Dye & Painting Color Studio */}
                      <div
                        className={`order-2 lg:order-1 bg-white p-4 rounded-2xl border-3 border-nupul-dark flex flex-col space-y-3 justify-between ${
                          canvasMode === "free" ? "lg:col-span-2" : "lg:col-span-3"
                        }`}
                      >
                        {/* Active Brush Header */}
                        <div className="bg-nupul-cream p-2 rounded-xl border-2 border-nupul-dark/15 flex items-center justify-between gap-2 relative">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Selected Color preview bubble */}
                            <div
                              className="w-8 h-8 rounded-lg border-2 border-nupul-dark shrink-0 relative overflow-hidden transition-all duration-300"
                              style={{ backgroundColor: selectedColor }}
                            />
                            <div className="min-w-0">
                              <span className="text-[7.5px] uppercase tracking-wider font-mono text-[#28b06e] font-black leading-none block">
                                当前笔尖
                              </span>
                              <h4 className="text-caption font-bold text-nupul-dark truncate leading-tight mt-0.5">
                                {colorName}
                              </h4>
                              <span className="text-[8px] font-mono text-[#28b06e] font-bold block leading-none">
                                {selectedColor.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Native OS Picker Eye-dropper clicker */}
                          <label
                            className="w-7 h-7 rounded-lg bg-white hover:bg-nupul-soft-yellow border-2 border-nupul-dark flex items-center justify-center cursor-pointer group shrink-0"
                            title="点击直接吸色或呼出系统调色盘"
                          >
                            <input
                              type="color"
                              value={
                                selectedColor.startsWith("#") &&
                                selectedColor.length === 7
                                  ? selectedColor
                                  : "#1a365d"
                              }
                              onChange={(e) => {
                                const hex = e.target.value;
                                setSelectedColor(hex);
                                setColorName(`调色自选 (${hex.toUpperCase()})`);
                              }}
                              className="absolute w-0 h-0 opacity-0 pointer-events-none"
                            />
                          </label>
                        </div>

                        {/* Dual Tabs switcher representing Dali design layout */}
                        <div className="grid grid-cols-2 p-0.5 bg-nupul-cream border-2 border-nupul-dark rounded-lg gap-0.5">
                          <button
                            onClick={() => setColorTab("heritage")}
                            className={`text-[9.5px] font-bold py-1 rounded transition-all cursor-pointer ${
                              colorTab === "heritage"
                                ? "bg-[#ffc526] text-nupul-dark border border-nupul-dark font-extrabold"
                                : "text-nupul-dark/60 hover:text-nupul-dark"
                            }`}
                          >
                            非遗彩谱
                          </button>
                          <button
                            onClick={() => setColorTab("custom")}
                            className={`text-[9.5px] font-bold py-1 rounded transition-all cursor-pointer ${
                              colorTab === "custom"
                                ? "bg-[#ffc526] text-nupul-dark border border-nupul-dark font-extrabold"
                                : "text-nupul-dark/60 hover:text-nupul-dark"
                            }`}
                          >
                            纹 幻彩自由配
                          </button>
                        </div>

                        {/* Tab 1 Content: Heritage Palette Dense Circle Grid */}
                        {colorTab === "heritage" && (
                          <div className="grid grid-cols-3 gap-2 py-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                            {colors.map((c) => {
                              const simpleName = c.name.split(" ")[0];
                              const isActive =
                                selectedColor.toLowerCase() ===
                                c.hex.toLowerCase();
                              return (
                                <button
                                  key={c.name}
                                  onClick={() => {
                                    setSelectedColor(c.hex);
                                    setColorName(c.name);
                                  }}
                                  className={`flex flex-col items-center p-1 rounded-lg transition-all border-2 cursor-pointer ${
                                    isActive
                                      ? "bg-[#28b06e]/10 border-nupul-dark scale-102"
                                      : "border-transparent hover:bg-nupul-cream"
                                  }`}
                                  title={c.name}
                                >
                                  {/* circular color circle blot */}
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 border-nupul-dark relative overflow-hidden flex items-center justify-center transition-transform ${
                                      isActive ? "scale-105" : "hover:scale-102"
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                  >
                                    {isActive && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white border border-nupul-dark" />
                                    )}
                                  </div>
                                  <span className="text-[8px] font-bold text-nupul-dark mt-0.5 text-center leading-none truncate w-full select-none">
                                    {simpleName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Tab 2 Content: High Freedom Slider Tint Explorer containing Conic Color Wheel */}
                        {colorTab === "custom" && (
                          <div className="flex flex-col space-y-3 py-1 items-center">
                            {/* Conic Gradient Color Wheel (色环) Container */}
                            <div className="flex flex-col items-center space-y-1 w-full">
                              <span className="text-[8px] font-bold text-nupul-dark leading-none mb-0.5 self-start">
                                纹 洱海非遗幻彩色环 (Touch/Drag to Pick)
                              </span>

                              <div
                                onPointerDown={handleColorWheelInteraction}
                                onPointerMove={(e) => {
                                  if (e.buttons > 0)
                                    handleColorWheelInteraction(e);
                                }}
                                className="w-28 h-28 rounded-full border-3 border-nupul-dark relative cursor-crosshair overflow-hidden shrink-0 select-none touch-none bg-white"
                                style={{
                                  background:
                                    "conic-gradient(from 0deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                                }}
                              >
                                {/* Radial desaturation mask (pure white in center, transparent at edge) */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />

                                {/* Mathematical interactive selector knob */}
                                {(() => {
                                  const angleRad = (customH * Math.PI) / 180;
                                  const radiusRatio = customS / 100;
                                  const radiusPixels = radiusRatio * 52; // Max radius on 112px wide circle
                                  const knobX =
                                    56 + Math.cos(angleRad) * radiusPixels;
                                  const knobY =
                                    56 + Math.sin(angleRad) * radiusPixels;
                                  return (
                                    <div
                                      className="absolute w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-nupul-dark bg-transparent pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-shadow"
                                      style={{
                                        left: `${knobX}px`,
                                        top: `${knobY}px`,
                                      }}
                                    />
                                  );
                                })()}
                              </div>

                              <div className="flex justify-between w-full text-[8.5px] font-mono text-nupul-dark/80 font-bold px-1 mt-0.5 leading-none">
                                <span>色相: {customH}°</span>
                                <span>饱和度: {customS}%</span>
                              </div>
                            </div>

                            {/* Lightness Slider to fine-tune tint value */}
                            <div className="w-full space-y-0.5 bg-nupul-cream p-1.5 rounded-lg border border-nupul-dark/15 shrink-0">
                              <div className="flex justify-between text-[7px] font-bold text-nupul-dark/80 leading-none">
                                <span>色彩亮度 (Lightness)</span>
                                <span className="font-mono text-[8.5px]">
                                  {customL}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="15"
                                max="85"
                                value={customL}
                                onChange={(e) => {
                                  const l = parseInt(e.target.value);
                                  setCustomL(l);
                                  updateCustomColorFromHsl(customH, customS, l);
                                }}
                                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#28b06e]"
                              />
                            </div>

                            {/* Quick Selection Swatches Grid (快选幻彩色卡拼块) */}
                            <div className="w-full space-y-1 border-t border-dashed border-nupul-dark/15 pt-2">
                              <span className="text-[8px] font-bold text-nupul-dark/70 block leading-none">
                                民族百代自研色块板
                              </span>
                              <div className="grid grid-cols-4 gap-1">
                                {[
                                  { name: "雪山白", hex: "nupul-cream" },
                                  { name: "朱砂红", hex: "#d9383a" },
                                  { name: "向日黄", hex: "#ffc526" },
                                  { name: "林染绿", hex: "#2f754b" },
                                  { name: "极海蓝", hex: "#165e9c" },
                                  { name: "深黛紫", hex: "#4d2d54" },
                                  { name: "土窑褐", hex: "#8a4b27" },
                                  { name: "玄石黑", hex: "#262626" },
                                ].map((item) => {
                                  const isActive =
                                    selectedColor.toLowerCase() ===
                                    item.hex.toLowerCase();
                                  return (
                                    <button
                                      key={item.hex}
                                      onClick={() => {
                                        setSelectedColor(item.hex);
                                        setColorName(`幻彩自选 · ${item.name}`);
                                        // Parse back to HSL roughly or approximate simple values
                                        if (item.hex === "nupul-cream") {
                                          setCustomH(50);
                                          setCustomS(15);
                                          setCustomL(85);
                                        } else if (item.hex === "#d9383a") {
                                          setCustomH(0);
                                          setCustomS(70);
                                          setCustomL(50);
                                        } else if (item.hex === "#ffc526") {
                                          setCustomH(45);
                                          setCustomS(80);
                                          setCustomL(60);
                                        } else if (item.hex === "#2f754b") {
                                          setCustomH(144);
                                          setCustomS(55);
                                          setCustomL(35);
                                        } else if (item.hex === "#165e9c") {
                                          setCustomH(208);
                                          setCustomS(75);
                                          setCustomL(35);
                                        } else if (item.hex === "#4d2d54") {
                                          setCustomH(295);
                                          setCustomS(35);
                                          setCustomL(25);
                                        } else if (item.hex === "#8a4b27") {
                                          setCustomH(22);
                                          setCustomS(55);
                                          setCustomL(35);
                                        } else if (item.hex === "#262626") {
                                          setCustomH(0);
                                          setCustomS(0);
                                          setCustomL(15);
                                        }
                                      }}
                                      className={`w-full aspect-square rounded-md border-2 cursor-pointer transition-transform duration-200 flex items-center justify-center relative ${
                                        isActive
                                          ? "border-nupul-green-dark scale-105"
                                          : "border-nupul-dark/20 hover:scale-102 hover:border-nupul-dark"
                                      }`}
                                      style={{ backgroundColor: item.hex }}
                                      title={item.name}
                                    >
                                      {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white border border-nupul-dark" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-[7.5px] text-stone-400 border-t border-dashed border-stone-200 pt-1 text-center leading-none">
                          指尖吸取色度 · 支持外连万物
                        </div>
                      </div>

                      <div
                        className={`order-1 lg:order-2 flex items-stretch w-full min-w-0 ${
                          canvasMode === "free" ? "lg:col-span-10" : "lg:col-span-9"
                        }`}
                      >
                        {canvasMode === "pattern" ? (
                          <PatternColoringBoard
                            ref={patternBoardRef}
                            pattern={activePattern}
                            selectedColor={selectedColor}
                          />
                        ) : (
                          <FreeDrawBoard
                            ref={freeDrawBoardRef}
                            selectedColor={selectedColor}
                          />
                        )}
                      </div>
                      </div>
                    </div>

                    {/* Bottom: Student Name and publishing portal (Nupul style soft block) */}
                    <div className="relative bg-nupul-cream p-5 rounded-2xl border-3 border-nupul-dark grid grid-cols-1 md:grid-cols-12 gap-4 items-center overflow-hidden">
                      {renderDiffuseAccents([
                        { corner: "bl", color: "green", inset: true, soft: true, size: "sm" },
                        { dot: true, color: "yellow", soft: true, className: "bottom-4 right-4" },
                      ])}
                      <div className="md:col-span-4 space-y-1 relative z-10">
                        <label className="block text-caption font-bold text-nupul-dark">
                          作者签名 (孩子名字):
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border-3 border-nupul-dark rounded-xl py-2 px-3 text-caption font-semibold focus:outline-none focus:bg-white text-nupul-dark"
                          placeholder="你的姓名 / 学号"
                          value={publishAuthor}
                          onChange={(e) => setPublishAuthor(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-5 space-y-1 relative z-10">
                        <label className="block text-caption font-bold text-nupul-dark">
                          作品趣想自豪感日记 (一句话感悟):
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border-3 border-nupul-dark rounded-xl py-2 px-3 text-caption font-semibold focus:outline-none focus:bg-white text-nupul-dark"
                          placeholder="写下你为什么涂这个颜色，比如：“我希望像苍山松树一样常青”"
                          value={publishDiary}
                          onChange={(e) => setPublishDiary(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-3 pt-3 md:pt-0 relative z-10">
                        <button
                          onClick={handlePublish}
                          disabled={publishedSuccess}
                          className="w-full nupul-pill-btn-green py-2.5 px-4 flex items-center justify-center space-x-1 text-caption cursor-pointer"
                        >
                          {publishedSuccess ? (
                            <>
                              <span>一键发表成功！</span>
                            </>
                          ) : (
                            <>
                              <span>一键发布学校展厅</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          )}

          {/* Module 3: Digital Student Masterworks Hall */}
          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <SubPageNav
                items={[
                  ...STUDENT_GALLERY_MODULES.filter((m) => m.id !== "upload"),
                  { id: "rank", label: "班级排行榜", icon: "favorites" },
                ]}
                active={subGallery === "detail" ? "hall" : subGallery}
                onChange={(id) => {
                  setSubGallery(id);
                  if (id === "hall") setSelectedGalleryWork(null);
                }}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchStudentTab("canvas")}
                  className="text-caption font-bold bg-nupul-yellow text-nupul-dark border-2 border-nupul-dark px-4 py-2 rounded-xl cursor-pointer"
                >
                  上传作品 → 智慧绘画
                </button>
              </div>
              {subGallery === "detail" && (
                <GalleryDetailPanel
                  work={selectedGalleryWork}
                  quad={galleryQuad}
                  onQuad={setGalleryQuad}
                  onBack={() => {
                    setSubGallery("hall");
                    setSelectedGalleryWork(null);
                  }}
                />
              )}
              {subGallery === "mine" && (
                <MySubmissionsPanel
                  works={mySubmissions}
                  loading={mySubmissionsLoading}
                  showPendingBanner={publishPendingNotice}
                  onDismissBanner={() => setPublishPendingNotice(false)}
                />
              )}
              {subGallery === "rank" && <ClassRankPanel />}
              {subGallery === "hall" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-nupul-dark/15 pb-3">
                    <div>
                      <h3 className="text-display-md font-bold text-nupul-dark tracking-tight">
                        班级照壁展 · 非遗少儿美育长廊
                      </h3>
                    </div>
                  </div>

                  {/* Artwork Cards Tiling layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localGallery.map((work) => (
                      <motion.div
                        key={work.id}
                        whileHover={{ y: -3 }}
                        onClick={() => {
                          setSelectedGalleryWork(work);
                          setSubGallery("detail");
                          setGalleryQuad("view");
                        }}
                        className="bg-white rounded-[24px] border-3 border-nupul-dark overflow-hidden flex flex-col justify-between cursor-pointer"
                      >
                        {/* Visual box */}
                        <div className="relative aspect-video bg-slate-100 overflow-hidden border-b-3 border-nupul-dark">
                          {renderDiffuseAccents(DIFFUSE_PRESETS.galleryCard)}
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            className="vector-illustration w-full h-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          {work.badge && (
                            <div className="absolute top-2.5 left-2.5 bg-nupul-yellow text-nupul-dark border-2 border-nupul-dark text-caption font-bold tracking-wider px-2.5 py-1 rounded-full">
                              {work.badge}
                            </div>
                          )}

                          <div className="absolute bottom-0 inset-x-0 bg-nupul-dark/90 border-t-2 border-nupul-dark p-3 text-white">
                            <span className="text-caption text-nupul-yellow font-bold block">
                              {work.grade} // {work.studentName} 大作
                            </span>
                            <h4 className="text-secondary font-bold leading-snug mt-0.5">
                              {work.title}
                            </h4>
                          </div>
                        </div>

                        {/* Meta and text diary */}
                        <div className="p-4 space-y-3">
                          <p className="text-caption text-slate-800 leading-relaxed max-h-[85px] overflow-y-auto italic font-bold">
                            “ {work.diary} ”
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {work.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-caption bg-nupul-dark/5 text-nupul-dark py-0.5 px-2 rounded-full border border-nupul-dark/10 font-bold"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between border-t-2 border-nupul-dark/10 pt-3">
                            <span className="text-caption font-mono text-nupul-dark/50 font-bold">
                              登载日：{work.date}
                            </span>

                            <div className="flex items-center space-x-2 text-caption font-bold shrink-0">
                              <span className="text-nupul-green-dark bg-nupul-green/10 px-2.5 py-1 rounded-full text-caption border border-nupul-green/20">
                                已入档
                              </span>
                              <button
                                onClick={async () => {
                                  try {
                                    const result = await api.artworks.like(
                                      work.id,
                                    );
                                    setLocalGallery((prev) =>
                                      prev.map((w) =>
                                        w.id === work.id
                                          ? {
                                              ...w,
                                              likes: result.likes,
                                              hasLiked: result.hasLiked,
                                            }
                                          : w,
                                      ),
                                    );
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="bg-nupul-orange/10 text-nupul-dark border-2 border-nupul-dark hover:bg-nupul-orange/15 hover:scale-102 transition px-2.5 py-1 rounded-full flex items-center space-x-1 cursor-pointer"
                              >
                                <span className="font-bold text-caption">
                                  {work.likes} 加油
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Traditional tie-dye ink wash bleed immersion loader overlay */}
      <AnimatePresence>
        {isInkBleeding && (
          <InkBleedLoader
            onComplete={handlePublishComplete}
            studentName={publishAuthor}
            patternName={activePattern.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
