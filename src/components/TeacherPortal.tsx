import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Course,
  Resource,
  StudentArtwork,
  StudentProgressStats,
  Announcement,
  ScheduleItem,
} from "../types";
import { api } from "../api/client";
import { useProjectionSync } from "../hooks/useProjectionSync";
import { SubPageNav } from "./shared/SubPageNav";
import { BackButtonLabel, NupulIcon } from "./icons";
import { PanoramaLessonPanel } from "./shared/PanoramaLessonPanel";
import { PanoramaFullscreenOverlay } from "./shared/PanoramaFullscreenOverlay";
import {
  PanoramaTourViewport,
  getPanoramaView,
} from "./shared/PanoramaTourViewport";
import {
  syncIdFromViewId,
  type PanoramaViewId,
} from "../data/panoramaViews";
import {
  XiaochaAvatarImg,
  XiaochaMascotPanel,
} from "./shared/XiaochaMascotPanel";
import { ProjectionDeployView } from "./teacher/ProjectionDeployView";
import {
  LessonPptOverlay,
  courseFromAiPlan,
  type LessonSlide,
} from "./teacher/LessonPptOverlay";
import {
  canvasDemoHint,
  drawTopicDemoOnCanvas,
  resolveLessonTopic,
} from "../lib/xiaochaAi";
import {
  buildBeautifiedSlidesFromAiPlan,
  buildBeautifiedSlidesFromCourse,
  buildBeautifiedSlidesFromStoryLesson,
  courseFromStoryLesson,
} from "../lib/lessonPpt";
import { DALI_STORY_LESSONS } from "../data/daliStoryMap";
import { StoryWallMap } from "./teacher/StoryWallMap";
import {
  ResourcePreviewPanel,
  PlatformSyncPanel,
  LocalUploadPanel,
  ExportReportPanel,
  WorkReviewDetailPanel,
} from "./teacher/TeacherDeepPanels";
import { NoticeBellIndicator } from "./shared/NoticeBellIndicator";
import type { TeacherMainTab } from "./shared/MainPortalNav";
import { NavTabBar, getNavTabButtonClass } from "./ui/NavTab";
import { CategoryTag, StatusTag } from "./ui/Tag";
import {
  DIFFUSE_PRESETS,
  renderDiffuseAccents,
} from "./ui/DiffuseDecor";
import {
  TEACHER_3D_MODULES,
  TEACHER_DISPLAY_MODULES,
  TEACHER_HOME_ENTRIES,
  TEACHER_LESSON_CATEGORIES,
  TEACHER_REVIEW_CAPABILITIES,
} from "../data/portalFramework";

interface TeacherPortalProps {
  activeTab: TeacherMainTab;
  onActiveTabChange: (tab: TeacherMainTab) => void;
  teacherName: string;
  courses: Course[];
  resources: Resource[];
  studentWorks: StudentArtwork[];
  stats: StudentProgressStats & { prideScore?: number };
  announcements: Announcement[];
  schedules: ScheduleItem[];
  dashboard: {
    pendingReviews: number;
    prideScore: number;
    galleryCount: number;
  } | null;
  onRefresh: () => void;
  readNoticeIds: Set<string>;
  onOpenNoticesInbox: (noticeId?: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  activeTab,
  onActiveTabChange,
  teacherName,
  courses,
  resources,
  studentWorks,
  stats,
  announcements,
  schedules,
  dashboard,
  onRefresh,
  readNoticeIds,
  onOpenNoticesInbox,
}) => {
  const [homeSubView, setHomeSubView] = useState<
    "main" | "3d_view" | "whiteboard" | "q_and_a"
  >("main");
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    null,
  );
  const [sub3dTeach, setSub3dTeach] = useState("present");
  const [subResources, setSubResources] = useState("browse");
  const [showLocalUpload, setShowLocalUpload] = useState(false);
  const [showResourcePreview, setShowResourcePreview] = useState(false);
  const [subWorks, setSubWorks] = useState("pending");
  const [storyPptLoadingId, setStoryPptLoadingId] = useState<string | null>(
    null,
  );
  const [showWorkReview, setShowWorkReview] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [selectedReviewWork, setSelectedReviewWork] =
    useState<StudentArtwork | null>(null);
  const [workReviewQuad, setWorkReviewQuad] = useState("preview");
  const unreadNoticeCount = announcements.filter(
    (a) => !readNoticeIds.has(a.id),
  ).length;

  const switchTeacherTab = (tab: TeacherMainTab) => {
    onActiveTabChange(tab);
    setSubResources("browse");
    setShowLocalUpload(false);
    setShowResourcePreview(false);
    setSelectedResource(null);
    setSubWorks("pending");
    setShowWorkReview(false);
    setSelectedReviewWork(null);
    setSub3dTeach("present");
  };

  // -------------------------------------------------------------
  // Teacher 3D Panoramic View State
  // -------------------------------------------------------------
  const [selectedPanoramaView, setSelectedPanoramaView] =
    useState<PanoramaViewId>("overview");
  const [panoramaFullscreen, setPanoramaFullscreen] = useState(false);
  const {
    projection,
    broadcastProjection,
    labTerminals,
    labRefreshing,
    refreshLabStatus,
  } = useProjectionSync("teacher");
  const isProjectedToStudents = projection.active;
  const activePanorama = getPanoramaView(selectedPanoramaView);
  const projectionSyncId = syncIdFromViewId(selectedPanoramaView);

  const selectPanoramaView = (viewId: PanoramaViewId) => {
    setSelectedPanoramaView(viewId);
    const syncId = syncIdFromViewId(viewId);
    if (isProjectedToStudents) {
      broadcastProjection(syncId, true);
      api.panorama.setProjection(syncId, true).catch(() => {});
    }
  };

  // -------------------------------------------------------------
  // Teacher Smart Whiteboard State
  // -------------------------------------------------------------
  const [drawingMode, setDrawingMode] = useState<"pen" | "eraser">("pen");
  const [brushColor, setBrushColor] = useState<string>("#1a365d"); // Dali Indigo
  const [brushSize, setBrushSize] = useState<number>(5);
  const [whiteboardAiOpen, setWhiteboardAiOpen] = useState(false);
  const [whiteboardAiInput, setWhiteboardAiInput] = useState("");
  const [whiteboardDemoHint, setWhiteboardDemoHint] = useState<string | null>(
    null,
  );
  // -------------------------------------------------------------
  // Teacher Smart Q&A Chat State
  // -------------------------------------------------------------
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: "user" | "bot"; text: string; source?: string }>
  >([
    {
      sender: "bot",
      text: "您好，徐老师！我是非遗大理民居彩绘教学智慧助教“小茶 AI”。请问您在今天的课程设计、教案规划或者文化常识讲解上，有什么需要解答的吗？您可以直接键入您的教学难点，或者点击左侧的非遗常备智库快捷提问模版一键咨询。",
      source: "本地非遗教学智库",
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [isQAndAGenerating, setIsQAndAGenerating] = useState<boolean>(false);
  const chatScrollRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (homeSubView !== "q_and_a") return;
    const el = chatScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chatHistory, isQAndAGenerating, homeSubView]);

  // -------------------------------------------------------------
  // Canvas references
  // -------------------------------------------------------------
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  // -------------------------------------------------------------
  // 1. AI Lesson Plan State
  // -------------------------------------------------------------
  const [activeCourseCategory, setActiveCourseCategory] = useState<
    "base" | "motif" | "color" | "craft"
  >("base");
  const [lessonTopic, setLessonTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedPlan, setAiGeneratedPlan] = useState<{
    title: string;
    subtitle: string;
    parts: { name: string; desc: string; tip: string }[];
    suggestions: string[];
  } | null>(null);
  const [lessonPresentCourse, setLessonPresentCourse] =
    useState<Course | null>(null);
  const [lessonPresentSlides, setLessonPresentSlides] = useState<
    LessonSlide[] | null
  >(null);

  const openLessonPpt = (course: Course, slides?: LessonSlide[]) => {
    setLessonPresentSlides(slides ?? null);
    setLessonPresentCourse(course);
  };

  const closeLessonPpt = () => {
    setLessonPresentCourse(null);
    setLessonPresentSlides(null);
  };

  const handleConfirmAiPlan = async () => {
    if (!aiGeneratedPlan) return;
    const slides = await buildBeautifiedSlidesFromAiPlan(aiGeneratedPlan);
    openLessonPpt(courseFromAiPlan(aiGeneratedPlan), slides);
  };

  const handleGenerateStoryLessonPpt = async (storyId: string) => {
    const story = DALI_STORY_LESSONS.find((s) => s.id === storyId);
    if (!story) return;
    setStoryPptLoadingId(storyId);
    try {
      const slides = await buildBeautifiedSlidesFromStoryLesson(story.id);
      openLessonPpt(courseFromStoryLesson(story), slides);
    } catch (e) {
      console.error(e);
      alert("照壁故事课课件生成失败，请稍后重试");
    } finally {
      setStoryPptLoadingId(null);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonTopic.trim()) return;
    setIsGenerating(true);
    setAiGeneratedPlan(null);

    try {
      const data = await api.ai.prepare(lessonTopic);
      setAiGeneratedPlan(data);

      await api.courses.create({
        title: data.title || lessonTopic,
        category: "motif",
        desc:
          data.subtitle ||
          "由 AI 备课精灵为您定制生成的15分钟民非遗深度研学微课程。",
        duration: "15分钟精讲",
        difficulty: "进阶",
        isLocal: true,
        outline: data.parts
          ? data.parts.map((p) => p.name)
          : ["教学指导第一步", "第二步"],
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      // Fallback preview
      setAiGeneratedPlan({
        title: `特色大理文化：${lessonTopic}的审美实践`,
        subtitle: "适合全学段 / 大理非遗15分美育课件",
        parts: [
          {
            name: "1. 创设情景与故事融入",
            desc: "引导孩子们在音乐中，闭眼想象苍山蝴蝶泉畔、古院照壁之下的彩绘传说，触动童心。",
            tip: "老师可轻点播放白语民谣作为底音，无需深奥理论讲解。",
          },
          {
            name: "2. 经典几何比例勾线",
            desc: "在大屏幕上展示经典纹路的对称原理。让孩子们拿起数字画板，感受由线条交汇产生美感的震撼。",
            tip: "对握笔能力弱的孩子，鼓励先用智能白模上色，打牢色彩信心。",
          },
          {
            name: "3. 一句话美育自豪日记",
            desc: "学生在分享墙上展示作品，并讲述自己涂这些配色的爱家乡初意，由教师为其颁发数字传承勋章。",
            tip: "少批评技法过错，多赞扬色彩创意和童真情感表达。",
          },
        ],
        suggestions: [
          "可以将教案一键打印，并配套多媒体资源下载包",
          "课后多鼓励将线稿画带回家与亲人分享古旧故事",
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // Whiteboard Canvas Drawing Logic
  // -------------------------------------------------------------
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (650 / rect.width),
      y: (e.clientY - rect.top) * (380 / rect.height),
    };
  };

  const getEraserSquareSize = () => 32;

  const stampEraserSquares = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    const size = getEraserSquareSize();
    const half = size / 2;
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / (size * 0.45)));

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      ctx.fillRect(x - half, y - half, size, size);
    }
    ctx.restore();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsMouseDown(true);
    setLastPos(pos);

    if (drawingMode === "eraser" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) stampEraserSquares(ctx, pos, pos);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const currentPos = getMousePos(e);

    if (drawingMode === "pen") {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    } else {
      stampEraserSquares(ctx, lastPos, currentPos);
    }

    setLastPos(currentPos);
  };

  const handleCanvasMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const getActiveLessonTopic = () =>
    resolveLessonTopic({
      lessonPresentCourseTitle: lessonPresentCourse?.title,
      aiGeneratedPlanTitle: aiGeneratedPlan?.title,
      lessonTopic,
    });

  const handleWhiteboardAiDemo = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const topic = getActiveLessonTopic();
    drawTopicDemoOnCanvas(
      ctx,
      topic,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    setWhiteboardDemoHint(canvasDemoHint(topic));
  };

  // Helper to submit teacher questions
  const handleSendQAndA = async (textToSend?: string) => {
    const messageText = textToSend || currentQuestion;
    if (!messageText.trim()) return;

    const userMsg = { sender: "user" as const, text: messageText };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setCurrentQuestion("");
    setIsQAndAGenerating(true);

    try {
      const data = await api.ai.chat(
        messageText,
        chatHistory.slice(-4).map((h) => ({ sender: h.sender, text: h.text })),
        "teacher",
        getActiveLessonTopic(),
      );
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: data.text, source: data.source || "小茶 AI" },
      ]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `关于“${messageText}”的探析，大理民居彩绘遵循“清白传家”的最高德育准则。例如，其照壁在下午能折射强光，照亮整个院落，是实用功能与儒家自律文化的完美融合。在教学中，推荐多让孩子们亲自调配‘孔雀石蓝’（石青）体验。`,
          source: "本地智库离线算法",
        },
      ]);
    } finally {
      setIsQAndAGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // 2. Resource Database State
  // -------------------------------------------------------------
  const [newResTitle, setNewResTitle] = useState("");
  const [newResType, setNewResType] = useState<"platform" | "core" | "local">(
    "local",
  );
  const [newResFileType, setNewResFileType] = useState("pdf");
  const [newResSize, setNewResSize] = useState("4.2 MB");
  const [resSuccessMsg, setResSuccessMsg] = useState(false);

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;

    try {
      await api.resources.create({
        title: newResTitle,
        type: newResType,
        fileType: newResFileType,
        size: newResSize,
      });
      onRefresh();
      setNewResTitle("");
      setResSuccessMsg(true);
      setTimeout(() => setResSuccessMsg(false), 2500);
    } catch (err) {
      console.error(err);
      alert("资源上传失败");
    }
  };

  // -------------------------------------------------------------
  // 3. Student Works Moderation State
  // -------------------------------------------------------------
  const [selectedBadgeMap, setSelectedBadgeMap] = useState<{
    [workId: string]: string;
  }>({});
  const [approvedList, setApprovedList] = useState<{
    [workId: string]: boolean;
  }>({});

  const badges = [
    "非遗文化传承人",
    "爱家乡自豪小兵",
    "苍山洱海守护先锋",
    "数字金牌调色师",
    "创意美育新星",
  ];

  const isWorkApproved = (work: StudentArtwork) =>
    work.id in approvedList ? approvedList[work.id] : work.approved;

  const handleApprove = async (workId: string) => {
    const chosenBadge = selectedBadgeMap[workId] || "创意美育新星";
    try {
      await api.artworks.approve(workId, chosenBadge);
      setApprovedList((prev) => ({ ...prev, [workId]: true }));
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("审批失败，请确认已登录教师账号");
    }
  };

  const handleUnpublish = async (workId: string) => {
    if (
      !window.confirm(
        "确定将该作品从线上长廊下架？下架后学生端画廊将不再展示此作。",
      )
    ) {
      return;
    }
    try {
      await api.artworks.unpublish(workId);
      setApprovedList((prev) => ({ ...prev, [workId]: false }));
      if (selectedReviewWork?.id === workId) {
        setShowWorkReview(false);
        setSelectedReviewWork(null);
        setWorkReviewQuad("preview");
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("下架失败，请确认已登录教师账号");
    }
  };

  return (
    <div className="ds-page portal-workspace py-2 md:py-3 flex flex-col gap-3 md:gap-4 h-full min-h-0">
      {/* Main Container - Redesigned to Nupul tactile thick outlined card style */}
      <div className="nupul-tactile-card portal-workspace-panel bg-white p-3 md:p-4 relative overflow-hidden min-h-0">
        {renderDiffuseAccents(DIFFUSE_PRESETS.mainPanel)}
        <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* TAB 1: HOME WORK BENCH */}
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Conditional subview switcher */}
              {homeSubView === "main" ? (
                <>
                  {/* 工作台总览：指标 + 工具 + 课表/公告（同页闭环） */}
                      {/* Stat Bento Grids */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* School Stats Box */}
                        <div className="lg:col-span-12 relative bg-white p-6 rounded-3xl border-3 border-nupul-dark grid grid-cols-1 sm:grid-cols-3 gap-6 items-center overflow-hidden">
                          {renderDiffuseAccents(DIFFUSE_PRESETS.stats)}
                          <div className="relative z-10 contents sm:contents">
                          <div className="space-y-1 block border-b sm:border-b-0 sm:border-r-3 sm:border-nupul-dark/10 pb-4 sm:pb-0 pr-4">
                            <span className="text-caption font-bold text-nupul-dark/50 block tracking-wider uppercase">
                              授课覆盖学生人数
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-nupul-dark">
                                {stats.activeStudents}
                              </span>
                              <span className="text-caption font-bold text-nupul-dark">
                                位
                              </span>
                            </div>
                            <span className="text-caption font-bold text-nupul-green-dark bg-[#eefbf0] border border-nupul-green-dark/20 px-2 py-0.5 rounded-full inline-block mt-1">
                              100% 民族非遗考核达标
                            </span>
                          </div>

                          <div className="space-y-1 block border-b sm:border-b-0 sm:border-r-3 sm:border-nupul-dark/10 pb-4 sm:pb-0 pr-4">
                            <span className="text-caption font-bold text-nupul-dark/50 block tracking-wider uppercase">
                              数智长卷画廊彩绘
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-nupul-dark">
                                {studentWorks.length}
                              </span>
                              <span className="text-caption font-bold text-nupul-dark">
                                份
                              </span>
                            </div>
                            <span className="text-caption font-bold text-nupul-orange bg-nupul-yellow/10 border border-nupul-orange/20 px-2 py-0.5 rounded-full inline-block mt-1">
                              {dashboard
                                ? `${dashboard.pendingReviews} 份作品待批`
                                : "统计加载中…"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-caption font-bold text-nupul-dark/50 block tracking-wider uppercase">
                              美育课题完成率
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-nupul-dark">
                                {stats.completionRate}%
                              </span>
                            </div>
                            <div className="w-full bg-nupul-dark/10 h-3 rounded-full mt-2 border-2 border-nupul-dark overflow-hidden">
                              <div
                                className="bg-nupul-green h-full rounded-full border-r-2 border-nupul-dark"
                                style={{ width: `${stats.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>

                      {/* 首页 · 目录框架快捷入口 */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {TEACHER_HOME_ENTRIES.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => {
                              if (entry.tab === "lessons") {
                                switchTeacherTab("lessons");
                                setActiveCourseCategory("base");
                                window.setTimeout(() => {
                                  document
                                    .getElementById("story-map-route")
                                    ?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                }, 200);
                                return;
                              }
                              if (entry.tab === "works") {
                                switchTeacherTab("works");
                                setSubWorks("pending");
                                return;
                              }
                              if (entry.id === "schedule") {
                                setExpandedScheduleId(schedules[0]?.id ?? null);
                              }
                            }}
                            className="bg-white border-3 border-nupul-dark rounded-2xl p-3.5 text-left cursor-pointer hover:bg-nupul-cream transition"
                          >
                            <span className="text-caption font-bold text-nupul-green-dark block">
                              {entry.label}
                            </span>
                            <span className="text-caption text-nupul-dark/65 font-semibold mt-1 block leading-snug">
                              {entry.desc}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* THREE CORE INTERACTIVE WORKSPACE CARDS (Based on the requested spec) */}
                      <div className="pt-2">
                        <h4 className="text-caption font-bold uppercase text-nupul-dark/60 tracking-wider mb-4">
                          3D鉴赏 · 智慧白板 · 智慧问答
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 w-full">
                          {/* CARD 1: 3D全景鉴赏 */}
                          <div
                            onClick={() => setHomeSubView("3d_view")}
                            className="bg-nupul-cream hover:bg-white rounded-2xl lg:rounded-3xl border-3 border-nupul-dark p-4 lg:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group min-h-0 sm:min-h-[168px] relative overflow-hidden"
                          >
                            {renderDiffuseAccents(DIFFUSE_PRESETS.toolCard(0))}
                            <div className="relative z-10 flex flex-col justify-between flex-1">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="w-11 h-11 lg:w-12 lg:h-12 shrink-0 rounded-2xl bg-nupul-yellow text-nupul-dark flex items-center justify-center border-2 border-nupul-dark group-hover:scale-105 transition-all">
                                <NupulIcon name="cube" size="lg" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h5 className="font-bold text-secondary lg:text-body text-nupul-dark">
                                    3D全景鉴赏
                                  </h5>
                                  <CategoryTag variant="accent">
                                    三维漫游
                                  </CategoryTag>
                                </div>
                                <p className="text-caption lg:text-caption text-nupul-dark/75 leading-snug font-semibold line-clamp-3 sm:line-clamp-2">
                                  {TEACHER_3D_MODULES.join(" · ")}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-dashed border-nupul-dark/15 flex items-center justify-between text-caption lg:text-caption font-bold text-nupul-green-dark">
                              <span>照壁故事地图导览</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-nupul-green animate-ping shrink-0"></span>
                            </div>
                            </div>
                          </div>

                          {/* CARD 2: 智慧白板 */}
                          <div
                            onClick={() => setHomeSubView("whiteboard")}
                            className="bg-nupul-cream hover:bg-white rounded-2xl lg:rounded-3xl border-3 border-nupul-dark p-4 lg:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group min-h-0 sm:min-h-[168px] relative overflow-hidden"
                          >
                            {renderDiffuseAccents(DIFFUSE_PRESETS.toolCard(1))}
                            <div className="relative z-10 flex flex-col justify-between flex-1">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="w-11 h-11 lg:w-12 lg:h-12 shrink-0 rounded-2xl bg-nupul-green text-nupul-dark flex items-center justify-center border-2 border-nupul-dark group-hover:scale-105 transition-all">
                                <NupulIcon name="tools" size="lg" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h5 className="font-bold text-secondary lg:text-body text-nupul-dark">
                                    智慧白板
                                  </h5>
                                  <CategoryTag variant="brand">
                                    AI协同
                                  </CategoryTag>
                                </div>
                                <p className="text-caption lg:text-caption text-nupul-dark/75 leading-snug font-semibold line-clamp-3 sm:line-clamp-2">
                                  {TEACHER_REVIEW_CAPABILITIES.slice(0, 2).join(" · ")}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-dashed border-nupul-dark/15 flex items-center justify-between text-caption lg:text-caption font-bold text-nupul-green-dark">
                              <span>AI一键点评与共创</span>
                            </div>
                            </div>
                          </div>

                          {/* CARD 3: 智慧问答 */}
                          <div
                            onClick={() => setHomeSubView("q_and_a")}
                            className="bg-nupul-cream hover:bg-white rounded-2xl lg:rounded-3xl border-3 border-nupul-dark p-4 lg:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group min-h-0 sm:min-h-[168px] relative overflow-hidden"
                          >
                            {renderDiffuseAccents(DIFFUSE_PRESETS.toolCard(2))}
                            <div className="relative z-10 flex flex-col justify-between flex-1">
                            <div className="flex gap-3 items-start flex-1">
                              <div className="w-11 h-11 lg:w-12 lg:h-12 shrink-0 rounded-2xl bg-sky-200 text-nupul-dark flex items-center justify-center border-2 border-nupul-dark group-hover:scale-105 transition-all">
                                <NupulIcon name="messages" size="lg" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h5 className="font-bold text-secondary lg:text-body text-nupul-dark">
                                    智慧问答
                                  </h5>
                                  <CategoryTag variant="accent">
                                    非遗大脑
                                  </CategoryTag>
                                </div>
                                <p className="text-caption lg:text-caption text-nupul-dark/75 leading-snug font-semibold line-clamp-3 sm:line-clamp-2">
                                  基于非遗知识库与AI大模型，快速解答教学与课程设计问题。
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-dashed border-nupul-dark/15 flex items-center justify-between text-caption lg:text-caption font-bold text-nupul-green-dark">
                              <span>呼唤小茶非遗AI助教</span>
                              <span className="text-caption tracking-wider font-mono bg-nupul-yellow/20 text-nupul-dark px-1.5 py-0.5 rounded border border-nupul-dark/15 shrink-0">
                                GPT
                              </span>
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Today Schedule Timeline & School Board Notices */}
                      <div className="rounded-3xl border-3 border-nupul-dark bg-nupul-cream/40 p-5 lg:p-6">
                        <header className="flex flex-wrap items-center justify-between gap-3 gap-y-2 pb-4 mb-5 border-b-2 border-nupul-dark/10">
                          <h4 className="text-display-sm font-medium text-nupul-dark/80 min-w-0">
                            今日课程 · 授课进度
                          </h4>
                          <button
                            type="button"
                            onClick={() => onOpenNoticesInbox()}
                            className="shrink-0 bg-nupul-yellow hover:bg-nupul-yellow text-nupul-dark border-3 border-nupul-dark px-3.5 py-1.5 rounded-xl text-caption font-bold cursor-pointer transition active:translate-y-0.5 inline-flex items-center gap-2"
                          >
                            <span className="text-secondary font-semibold">
                              通知接收
                            </span>
                            {unreadNoticeCount > 0 && (
                              <NoticeBellIndicator
                                title={`${unreadNoticeCount} 条新通知`}
                              />
                            )}
                          </button>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] gap-5 lg:gap-6 lg:items-stretch">
                          <div className="min-w-0 space-y-3">
                            <h5 className="text-caption font-bold text-nupul-dark/70 uppercase tracking-wider">
                              课表详情
                            </h5>
                            <div className="relative space-y-3 pl-1 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-1 before:bg-nupul-dark before:rounded-full">
                              {schedules.map((sch, idx) => {
                                const expanded = expandedScheduleId === sch.id;
                                return (
                                <div
                                  key={sch.id}
                                  className="flex items-start gap-3 relative"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-caption shrink-0 z-10 border-2 border-nupul-dark ${
                                      sch.status === "active"
                                        ? idx === 0
                                          ? "bg-nupul-yellow text-nupul-dark"
                                          : "bg-nupul-green text-nupul-dark"
                                        : "bg-slate-100 text-nupul-dark/45"
                                    }`}
                                  >
                                    {sch.time.slice(0, 2)}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedScheduleId(
                                        expanded ? null : sch.id,
                                      )
                                    }
                                    className={`border-3 border-nupul-dark rounded-2xl p-3.5 flex-1 min-w-0 text-left cursor-pointer transition ${
                                      sch.status === "active"
                                        ? "bg-nupul-cream"
                                        : "bg-nupul-cream/50 border-stone-800/10"
                                    } ${expanded ? "ring-2 ring-nupul-yellow ring-offset-1" : "hover:bg-white"}`}
                                  >
                                    <span
                                      className={`text-caption font-bold block ${sch.status === "active" ? "text-nupul-green-dark" : "text-nupul-dark/40"}`}
                                    >
                                      {sch.time} // {sch.className}
                                    </span>
                                    <h5
                                      className={`text-secondary font-semibold mt-0.5 ${sch.status === "pending" ? "text-nupul-dark/55" : "text-nupul-dark"}`}
                                    >
                                      {sch.title}
                                    </h5>
                                    <p
                                      className={`text-caption mt-1 leading-snug ${sch.status === "pending" ? "text-nupul-dark/50" : "text-nupul-dark/75"}`}
                                    >
                                      {sch.note}
                                    </p>
                                    {expanded && (
                                      <div className="mt-3 pt-3 border-t border-dashed border-nupul-dark/15 flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            switchTeacherTab("lessons");
                                          }}
                                          className="text-caption font-bold bg-nupul-yellow text-nupul-dark border-2 border-nupul-dark px-3 py-1.5 rounded-xl cursor-pointer"
                                        >
                                          进入备课 →
                                        </button>
                                        {sch.status === "active" && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHomeSubView("3d_view");
                                            }}
                                            className="text-caption font-bold bg-white text-nupul-dark border-2 border-nupul-dark px-3 py-1.5 rounded-xl cursor-pointer"
                                          >
                                            开启 3D 课堂
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </button>
                                </div>
                              );
                              })}
                            </div>
                          </div>

                          <aside className="min-w-0 lg:flex lg:flex-col space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-caption font-bold text-nupul-dark/70 uppercase tracking-wider">
                                校园公告
                              </h5>
                              <button
                                type="button"
                                onClick={() => onOpenNoticesInbox()}
                                className="text-caption font-bold text-nupul-green-dark hover:underline cursor-pointer"
                              >
                                查看全部 →
                              </button>
                            </div>
                            <div className="bg-white rounded-2xl border-3 border-nupul-dark p-3 lg:flex-1 lg:flex lg:flex-col lg:justify-start">
                              <ul className="space-y-0 divide-y divide-dashed divide-nupul-dark/12">
                                {announcements.map((ann) => (
                                  <li key={ann.id} className="first:pt-0 py-2.5 last:pb-0">
                                    <button
                                      type="button"
                                      onClick={() => onOpenNoticesInbox(ann.id)}
                                      className="w-full text-left cursor-pointer rounded-lg px-1 -mx-1 py-0.5 hover:bg-nupul-cream/80 transition"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                          <span className="text-caption font-mono font-bold text-nupul-orange/90 tracking-wide block leading-tight">
                                            {ann.date} // {ann.src}
                                          </span>
                                          <span className="text-caption font-bold text-nupul-dark/85 hover:text-nupul-green-dark transition line-clamp-2 leading-snug block mt-0.5">
                                            {ann.title}
                                          </span>
                                        </div>
                                        {!readNoticeIds.has(ann.id) && (
                                          <StatusTag
                                            variant="danger"
                                            className="shrink-0 mt-0.5"
                                          >
                                            未读
                                          </StatusTag>
                                        )}
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </aside>
                        </div>

                      </div>
                </>
              ) : homeSubView === "3d_view" ? (
                /* VIEW 1: 3D全景鉴赏 */
                <div className="space-y-6">
                  {sub3dTeach === "deploy" && (
                    <ProjectionDeployView
                      active={isProjectedToStudents}
                      hotspotId={projectionSyncId}
                      terminals={labTerminals}
                      refreshing={labRefreshing}
                      onBack={() => setSub3dTeach("present")}
                      onRefresh={refreshLabStatus}
                      onToggleProjection={async () => {
                        const next = !isProjectedToStudents;
                        try {
                          await api.panorama.setProjection(
                            projectionSyncId,
                            next,
                          );
                          broadcastProjection(projectionSyncId, next);
                        } catch (e) {
                          console.error(e);
                          alert("投屏失败，请确认教师已登录");
                        }
                      }}
                    />
                  )}
                  {sub3dTeach === "present" && (
                    <>
                      {/* Subview Header */}
                      <div className="flex items-center justify-between border-b-3 border-nupul-dark/10 pb-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setHomeSubView("main")}
                            className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
                          >
                            <BackButtonLabel />
                          </button>
                          <div>
                            <h4 className="text-display-sm font-bold text-nupul-dark">
                              3D鉴赏 · 喜洲民居与照壁故事地图
                            </h4>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSub3dTeach("deploy")}
                          className={`text-caption font-bold py-2 px-3.5 rounded-full border-3 border-nupul-dark transition active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
                            isProjectedToStudents
                              ? "bg-nupul-green text-nupul-dark"
                              : "bg-white text-nupul-dark/80"
                          }`}
                        >
                          <NupulIcon name="share" size="sm" />
                          <span>
                            {isProjectedToStudents
                              ? "投屏中 · 查看部署"
                              : "无线投屏到所有学生"}
                          </span>
                        </button>
                      </div>

                      {/* 3D Panorama Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <PanoramaTourViewport
                          className="lg:col-span-8"
                          variant="stage"
                          activeViewId={selectedPanoramaView}
                          onViewChange={selectPanoramaView}
                        />

                        <PanoramaLessonPanel
                          className="lg:col-span-4"
                          view={activePanorama}
                          variant="teacher"
                          isFullscreen={panoramaFullscreen}
                          onFullscreenPlay={() => setPanoramaFullscreen(true)}
                          onFullscreenExit={() => setPanoramaFullscreen(false)}
                        />
                      </div>

                      {panoramaFullscreen && (
                        <PanoramaFullscreenOverlay
                          activeViewId={selectedPanoramaView}
                          view={activePanorama}
                          onViewChange={selectPanoramaView}
                          onClose={() => setPanoramaFullscreen(false)}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : homeSubView === "whiteboard" ? (
                /* VIEW 2: 智慧白板 */
                <div className="space-y-6">
                  <>
                      {/* Header row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-3 border-nupul-dark/10 pb-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => setHomeSubView("main")}
                            className="shrink-0 bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
                          >
                            <BackButtonLabel />
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-display-sm font-bold text-nupul-dark leading-snug">
                              智慧教学协同电子黑白板
                            </h4>
                          </div>
                        </div>

                        {/* Quick brush controllers */}
                        <div className="flex items-center flex-wrap gap-2.5 bg-nupul-cream p-1.5 rounded-2xl border-2 border-nupul-dark shrink-0 self-start sm:self-auto">
                          <button
                            onClick={() => setDrawingMode("pen")}
                            className={`px-2 py-1.5 rounded-xl border transition cursor-pointer text-caption font-bold ${
                              drawingMode === "pen"
                                ? "bg-nupul-green text-nupul-dark border-nupul-dark"
                                : "bg-transparent text-nupul-dark/60 border-transparent hover:bg-stone-200/20"
                            }`}
                            title="画笔"
                          >
                            <NupulIcon name="brush" size="sm" />
                          </button>
                          <button
                            onClick={() => setDrawingMode("eraser")}
                            className={`px-2 py-1.5 rounded-xl border transition cursor-pointer text-caption font-bold ${
                              drawingMode === "eraser"
                                ? "bg-nupul-green text-nupul-dark border-nupul-dark"
                                : "bg-transparent text-nupul-dark/60 border-transparent hover:bg-stone-200/20"
                            }`}
                            title="板擦"
                          >
                            <NupulIcon name="tools" size="sm" />
                          </button>

                          {/* Divider */}
                          <span className="w-0.5 h-6 bg-stone-800/10"></span>

                          {/* Colors mapping */}
                          {[
                            { hex: "#1a365d", label: "石青" },
                            { hex: "#c53030", label: "朱红" },
                            { hex: "#2c3e50", label: "烟墨" },
                            { hex: "#e6bf47", label: "蛤黄" },
                          ].map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => {
                                setDrawingMode("pen");
                                setBrushColor(c.hex);
                              }}
                              className={`w-5 h-5 rounded-full border border-stone-900 transition scale-90 ${
                                brushColor === c.hex && drawingMode === "pen"
                                  ? "ring-2 ring-stone-900 select-all border-white border-2"
                                  : ""
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}

                          {/* Clear */}
                          <button
                            onClick={handleClearCanvas}
                            className="bg-white hover:bg-stone-100 text-nupul-dark px-2.5 py-1 rounded-xl border-2 border-nupul-dark text-caption font-bold flex items-center space-x-1 cursor-pointer transition"
                          >
                            <span>归零重擦</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-caption font-bold text-nupul-dark/50 block uppercase tracking-wide">
                              彩绘勾描面板
                            </span>
                            {drawingMode === "pen" && (
                              <div className="flex items-center space-x-2 text-caption font-bold text-nupul-dark/70">
                                <span>画笔尺寸:</span>
                                {[2, 5, 10, 15].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setBrushSize(s)}
                                    className={`w-5 h-5 rounded flex items-center justify-center border text-caption cursor-pointer ${
                                      brushSize === s
                                        ? "bg-nupul-dark text-white border-nupul-dark"
                                        : "bg-white text-stone-800 border-stone-200 hover:bg-stone-50"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* High-quality Drawing Canvas Container */}
                          <div className="bg-white border-3 border-nupul-dark rounded-3xl relative h-[380px] overflow-hidden group">
                            {renderDiffuseAccents([
                              { corner: "tr", color: "yellow", inset: true, soft: true, size: "sm" },
                            ])}
                            {/* Blueprint grid reference below drawing */}
                            <div
                              className="absolute inset-0 select-none pointer-events-none"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to right, #00000014 1px, transparent 1px), linear-gradient(to bottom, #00000014 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                              }}
                            />

                            {/* Interactive Canvas */}
                            <canvas
                              ref={canvasRef}
                              width={650}
                              height={380}
                              onMouseDown={handleCanvasMouseDown}
                              onMouseMove={handleCanvasMouseMove}
                              onMouseUp={handleCanvasMouseUp}
                              onMouseLeave={handleCanvasMouseUp}
                              className={`absolute inset-0 w-full h-full z-10 ${
                                drawingMode === "eraser"
                                  ? "cursor-cell"
                                  : "cursor-crosshair"
                              }`}
                            />

                            {/* AI 小助手：画板右下角 */}
                            <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
                              <AnimatePresence>
                                {whiteboardAiOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute bottom-full right-0 mb-2 w-[min(18rem,calc(100vw-2rem))] bg-white border-3 border-nupul-dark rounded-2xl overflow-hidden"
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-nupul-dark/10 bg-nupul-cream/50">
                                      <XiaochaAvatarImg />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-nupul-dark block">
                                          小茶 AI 小助手
                                        </span>
                                        <span className="text-[10px] font-semibold text-nupul-dark/55 block truncate">
                                          边画边问，备课答疑
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setWhiteboardAiOpen(false)}
                                        className="text-nupul-dark/45 hover:text-nupul-dark text-xs font-bold px-1 cursor-pointer"
                                        aria-label="关闭小助手"
                                      >
                                        关闭
                                      </button>
                                    </div>

                                    <div className="p-3 space-y-2.5 max-h-44 overflow-y-auto">
                                      {isQAndAGenerating ? (
                                        <p className="text-[11px] font-semibold text-nupul-dark/55 animate-pulse">
                                          正在查阅苍山古籍…
                                        </p>
                                      ) : (
                                        (() => {
                                          const lastBot = [...chatHistory]
                                            .reverse()
                                            .find((h) => h.sender === "bot");
                                          return lastBot ? (
                                            <p className="text-[11px] font-semibold text-nupul-dark/75 leading-snug line-clamp-4">
                                              {lastBot.text}
                                            </p>
                                          ) : whiteboardDemoHint ? (
                                            <p className="text-[11px] font-semibold text-nupul-green-dark leading-snug">
                                              {whiteboardDemoHint}
                                            </p>
                                          ) : (
                                            <p className="text-[11px] font-semibold text-nupul-dark/55">
                                              有教学难点？点下方快捷提问或直接输入。
                                            </p>
                                          );
                                        })()
                                      )}

                                      <div className="flex flex-wrap gap-1.5">
                                        {[
                                          "零基础的小学生怎么去开展墨线起初勾墨？",
                                          "如何形象地向孩子们表达‘清白传家’的精神图腾？",
                                        ].map((q) => (
                                          <button
                                            key={q}
                                            type="button"
                                            disabled={isQAndAGenerating}
                                            onClick={() => {
                                              handleSendQAndA(q);
                                              setWhiteboardAiInput("");
                                            }}
                                            className="text-left text-[10px] font-bold text-nupul-green-dark bg-nupul-cream border border-nupul-dark/15 rounded-lg px-2 py-1 hover:bg-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {q.slice(0, 14)}…
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="px-3 pb-3 flex gap-1.5 items-center">
                                      <input
                                        type="text"
                                        value={whiteboardAiInput}
                                        onChange={(e) =>
                                          setWhiteboardAiInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && whiteboardAiInput.trim()) {
                                            handleSendQAndA(whiteboardAiInput);
                                            setWhiteboardAiInput("");
                                          }
                                        }}
                                        disabled={isQAndAGenerating}
                                        placeholder="输入教学问题…"
                                        className="flex-1 min-w-0 bg-nupul-cream border-2 border-nupul-dark rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-nupul-dark placeholder-nupul-dark/40 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        disabled={
                                          isQAndAGenerating ||
                                          !whiteboardAiInput.trim()
                                        }
                                        onClick={() => {
                                          handleSendQAndA(whiteboardAiInput);
                                          setWhiteboardAiInput("");
                                        }}
                                        className="shrink-0 bg-nupul-green text-white px-2.5 py-1.5 rounded-xl border-2 border-nupul-dark text-[11px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nupul-green-dark transition"
                                      >
                                        发送
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWhiteboardAiOpen(false);
                                        setHomeSubView("q_and_a");
                                      }}
                                      className="w-full border-t-2 border-nupul-dark/10 py-2 text-[10px] font-bold text-nupul-green-dark hover:bg-nupul-cream/60 transition cursor-pointer"
                                    >
                                      前往完整智慧问答
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWhiteboardAiOpen((open) => {
                                    const next = !open;
                                    if (next) handleWhiteboardAiDemo();
                                    return next;
                                  });
                                }}
                                aria-label="打开 AI 小助手并生成本课示范画"
                                aria-expanded={whiteboardAiOpen}
                                className={`flex items-center gap-1.5 bg-white border-2 border-nupul-dark rounded-full pl-1 pr-3 py-1 hover:bg-nupul-cream transition cursor-pointer ${
                                  whiteboardAiOpen ? "ring-2 ring-nupul-green" : ""
                                }`}
                              >
                                <XiaochaAvatarImg />
                                <span className="text-xs font-bold text-nupul-dark whitespace-nowrap">
                                  AI小助手
                                </span>
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                  </>
                </div>
              ) : (
                /* VIEW 3: 智慧问答 */
                <div className="space-y-6">
                      {/* Header Row */}
                      <div className="flex items-center justify-between border-b-3 border-nupul-dark/10 pb-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setHomeSubView("main")}
                            className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
                          >
                            <BackButtonLabel />
                          </button>
                          <div>
                            <h4 className="text-display-sm font-bold text-nupul-dark">
                              洱海苍山非遗大模型教学智库
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Dialogue Workspace：模版 | 聊天（内含左侧数字人） */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
                        {/* Pre-made Hot Templates on Left (4 Cols) */}
                        <div className="lg:col-span-4 relative bg-nupul-cream p-5 rounded-3xl border-3 border-nupul-dark flex flex-col justify-between space-y-4 order-1 overflow-hidden">
                          {renderDiffuseAccents(DIFFUSE_PRESETS.chatSide)}
                          <div className="relative z-10 space-y-3 flex flex-col justify-between flex-1">
                          <div className="space-y-3">
                            <span className="text-caption font-bold text-nupul-dark/55 uppercase tracking-widest block">
                              快捷提问模版
                            </span>

                            <div className="space-y-3 pt-2">
                              {[
                                {
                                  q: "零基础的小学生怎么去开展墨线起初勾墨？",
                                  desc: "如何降低孩子们初尝毛笔握笔的害怕心理、讲解提顿的简单拟人法",
                                },
                                {
                                  q: "如何形象地向孩子们表达‘清白传家’的精神图腾？",
                                  desc: "介绍白族历史上太守杨震得蛤、不受黄金，家训传给孩子们的简单德育故事",
                                },
                                {
                                  q: "白族彩绘中的‘大理蓝白搭配’提炼自哪些大自然材料？",
                                  desc: "植物板蓝根染布、蔚蓝色重青孔雀石、极素贝壳粉等自然调和奥秘",
                                },
                                {
                                  q: "大理白语中关于祝福有哪几个代表性的传统词语？",
                                  desc: "教案中能教给学生唱演、口说的大理方言如拜寿“Daxi”等等",
                                },
                              ].map((tmpl, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleSendQAndA(tmpl.q)}
                                  className="bg-white hover:bg-stone-50 border-2 border-nupul-dark p-3 rounded-2xl cursor-pointer transition-all"
                                >
                                  <h6 className="text-caption font-bold text-nupul-green-dark hover:text-nupul-green leading-snug">
                                    {tmpl.q}
                                  </h6>
                                </div>
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>

                        {/* Chatbot (8 Cols)，数字人悬浮于输入栏上方 */}
                        <div className="lg:col-span-8 relative bg-white border-3 border-nupul-dark rounded-3xl flex flex-col justify-between min-h-[420px] lg:min-h-[480px] p-4 sm:p-5 overflow-hidden">
                          {renderDiffuseAccents(DIFFUSE_PRESETS.chatMain)}
                          <div className="relative z-10 flex flex-col justify-between flex-1 min-h-0">
                          {/* Active Companion Brand */}
                          <div className="flex items-center justify-between border-b border-stone-800/10 pb-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <XiaochaAvatarImg />
                              <div>
                                <span className="text-caption font-bold text-nupul-dark block font-bold">
                                  小茶 AI
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Message History Scroller */}
                          <div
                            ref={chatScrollRef}
                            className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden space-y-4 max-h-[310px] pr-2 pb-2 sm:pb-3 scroll-smooth"
                          >
                            {chatHistory.map((h, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-2.5 ${h.sender === "user" ? "justify-end" : "justify-start"}`}
                              >
                                {h.sender === "bot" && <XiaochaAvatarImg />}

                                <div
                                  className={`p-3.5 rounded-2xl max-w-[82%] text-caption leading-relaxed border-2 border-stone-900 ${
                                    h.sender === "user"
                                      ? "bg-nupul-green text-nupul-dark"
                                      : "bg-nupul-cream text-nupul-dark"
                                  }`}
                                >
                                  <p className="font-semibold">{h.text}</p>
                                  {h.source && (
                                    <span className="text-[8px] opacity-40 font-mono block mt-1.5 uppercase tracking-wide text-right">
                                      知识来源: {h.source}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}

                            {isQAndAGenerating && (
                              <div className="flex items-start gap-2.5">
                                <XiaochaAvatarImg />
                                <div className="bg-nupul-cream/50 p-3.5 rounded-2xl border-2 border-nupul-dark/10 text-caption text-nupul-dark/60 font-semibold animate-pulse">
                                  正在查阅苍山古籍精深彩绘配方与大唐太守文献中...
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Input：小茶锚定在输入栏左下角 */}
                          <div className="relative z-20 isolate min-h-[92px] pt-3 mt-1 border-t border-stone-800/10 overflow-visible">
                            <XiaochaMascotPanel
                              onAsk={(q) => handleSendQAndA(q)}
                              disabled={isQAndAGenerating}
                              thinking={isQAndAGenerating}
                            />
                            <div className="relative z-0 flex gap-2 items-end pl-[76px] sm:pl-[84px]">
                              <input
                                type="text"
                                value={currentQuestion}
                                onChange={(e) =>
                                  setCurrentQuestion(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleSendQAndA()
                                }
                                disabled={isQAndAGenerating}
                                className="bg-nupul-cream border-3 border-nupul-dark rounded-2xl px-3.5 py-2.5 text-caption font-semibold focus:outline-none flex-1 min-w-0 text-nupul-dark placeholder-nupul-dark/40"
                                placeholder="例如：怎么给孩子们传授‘白白墙上挂重蓝’的天然提炼理念？..."
                              />
                              <button
                                onClick={() => handleSendQAndA()}
                                disabled={
                                  isQAndAGenerating ||
                                  !currentQuestion.trim()
                                }
                                className="shrink-0 bg-nupul-yellow hover:bg-nupul-yellow text-nupul-dark border-2 border-nupul-dark px-4 py-2.5 rounded-2xl text-caption font-bold transition disabled:opacity-50 cursor-pointer enabled:active:translate-y-0.5"
                              >
                                发送
                              </button>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: COURSE PLANNER & AI GENERATOR */}
          {activeTab === "lessons" && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left sidebar: Course Outline List */}
                  <div
                    className={`flex flex-col space-y-4 ${
                      activeCourseCategory === "base"
                        ? "lg:col-span-12"
                        : "lg:col-span-7"
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-body font-bold text-nupul-dark">
                          AI备课 · 照壁故事课与专题微课
                        </h4>
                        <span className="text-caption text-nupul-dark/60 font-bold block mt-0.5">
                          一键急速备课 · 教学目标 · 课堂流程 · AI主讲稿
                        </span>
                      </div>

                      <NavTabBar prominent fullWidth>
                        {TEACHER_LESSON_CATEGORIES.map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() =>
                              setActiveCourseCategory(
                                id as typeof activeCourseCategory,
                              )
                            }
                            className={getNavTabButtonClass(
                              activeCourseCategory === id,
                              "quaternary",
                              "md",
                              true,
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </NavTabBar>

                    </div>

                    {/* Display filtered courses */}
                    <div
                      className={`space-y-4 pr-1 ${
                        activeCourseCategory === "base"
                          ? ""
                          : "overflow-y-auto max-h-[520px]"
                      }`}
                    >
                      {activeCourseCategory === "base" && (
                        <StoryWallMap
                          stories={DALI_STORY_LESSONS}
                          loadingStoryId={storyPptLoadingId}
                          onGenerate={handleGenerateStoryLessonPpt}
                        />
                      )}
                      {courses
                        .filter(
                          (c) =>
                            c.category === activeCourseCategory &&
                            activeCourseCategory !== "base",
                        )
                        .map((course) => (
                          <div
                            key={course.id}
                            className="bg-nupul-cream hover:bg-[#fffdf7] p-5 rounded-2xl border-3 border-nupul-dark flex flex-col justify-between relative group transition-all duration-200"
                          >
                            {course.isLocal && (
                              <span className="absolute top-3 right-3 text-caption bg-nupul-green text-nupul-dark py-0.5 px-3 rounded-full border-2 border-nupul-dark font-bold">
                                AI 一键备课定制
                              </span>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-caption font-bold bg-nupul-yellow text-nupul-dark rounded-md px-2 py-0.5 border-2 border-nupul-dark leading-none">
                                  {course.difficulty}
                                </span>
                                <span className="text-caption text-nupul-dark/60 font-bold">
                                  ⏱️ {course.duration}
                                </span>
                              </div>

                              <h5 className="text-secondary font-bold text-nupul-dark">
                                {course.title}
                              </h5>
                              <p className="text-caption text-nupul-dark/80 leading-relaxed font-medium">
                                {course.desc}
                              </p>
                            </div>

                            {/* Dropdown list steps of lesson outline */}
                            <div className="mt-3.5 pt-3.5 border-t-2 border-dashed border-nupul-dark/15 space-y-2">
                              <span className="text-caption font-bold text-nupul-green-dark uppercase tracking-widest block">
                                课程大纲核心环节:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {course.outline.map((out, idx) => (
                                  <span
                                    key={idx}
                                    className="text-caption text-nupul-dark/80 font-semibold leading-relaxed"
                                  >
                                    {out}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openLessonPpt(
                                    course,
                                    buildBeautifiedSlidesFromCourse(course),
                                  )
                                }
                                className="nupul-pill-btn-green py-2 px-3 text-caption flex items-center justify-center space-x-1 font-bold cursor-pointer"
                              >
                                <span>使用本篇教案上课</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Right column: Gemini AI One-click Lesson Generator */}
                  {activeCourseCategory !== "base" && (
                  <div className="lg:col-span-5 relative bg-white p-5 rounded-3xl border-3 border-nupul-dark flex flex-col justify-between space-y-4 overflow-hidden">
                    {renderDiffuseAccents(DIFFUSE_PRESETS.studio)}
                    <div className="relative z-10 space-y-3 flex flex-col justify-between flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1.5 text-nupul-dark">
                        <span className="font-bold text-secondary">
                          一键急速备课
                        </span>
                      </div>

                      <p className="text-caption text-nupul-dark/70 leading-relaxed font-semibold">
                        艺术课跨界设课不知道如何下手？键入一个核心彩绘美学主题，让
                        AI 白族传承精灵协助您自动备好 15
                        分钟极简趣味非遗微教案。
                      </p>

                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-2.5 px-3 pl-8 text-caption font-semibold focus:outline-none focus:bg-white text-nupul-dark placeholder-nupul-dark/40"
                          placeholder="例如: 蝴蝶纹、或者 照壁色彩搭配..."
                          value={lessonTopic}
                          onChange={(e) => setLessonTopic(e.target.value)}
                        />
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-nupul-dark text-caption"></span>
                      </div>

                      <button
                        onClick={handleGenerateLesson}
                        disabled={isGenerating}
                        className="w-full nupul-pill-btn-yellow py-3 px-4 flex items-center justify-center space-x-1.5 disabled:opacity-50 text-caption font-bold cursor-pointer"
                      >
                        <span>
                          {isGenerating
                            ? "AI传承助写精灵润笔中..."
                            : "一键极速定制 15 分钟微课"}
                        </span>
                      </button>
                    </div>

                    {/* Plan Render output */}
                    {aiGeneratedPlan && (
                      <div className="space-y-3">
                        <div className="bg-nupul-cream p-4 rounded-2xl border-3 border-nupul-dark max-h-[280px] overflow-y-auto space-y-4">
                          <div>
                            <span className="text-caption font-bold text-nupul-green-dark bg-nupul-green/10 border-2 border-nupul-green-dark/20 px-2.5 py-0.5 rounded-full">
                              美育示范案
                            </span>
                            <h5 className="text-secondary font-bold text-nupul-dark mt-2 leading-snug">
                              {aiGeneratedPlan.title}
                            </h5>
                            <span className="text-caption text-nupul-dark/50 font-semibold block">
                              {aiGeneratedPlan.subtitle}
                            </span>
                          </div>

                          <div className="space-y-4 pt-3.5 border-t-2 border-dashed border-nupul-dark/15">
                            {aiGeneratedPlan.parts.map((p, i) => (
                              <div
                                key={i}
                                className="space-y-1 block border-b border-nupul-dark/5 pb-2 last:border-b-0"
                              >
                                <span className="text-caption font-bold text-nupul-green-dark block">
                                  {p.name}
                                </span>
                                <p className="text-caption text-nupul-dark/80 leading-relaxed font-semibold">
                                  {p.desc}
                                </p>
                                <div className="bg-nupul-yellow/15 border-l-3 border-nupul-dark p-2 text-caption text-nupul-dark/90 font-bold leading-relaxed rounded-r-lg mt-1">
                                  <strong>授课贴士:</strong> {p.tip}
                                </div>
                              </div>
                            ))}
                          </div>

                          {aiGeneratedPlan.suggestions && (
                            <div className="pt-2 border-t-2 border-dashed border-nupul-dark/15 space-y-2">
                              <span className="text-caption font-bold text-nupul-dark/60 uppercase tracking-widest block">
                                拓展研学建议:
                              </span>
                              <ul className="pl-1 space-y-1">
                                {aiGeneratedPlan.suggestions.map((s, idx) => (
                                  <li
                                    key={idx}
                                    className="text-caption text-nupul-dark/75 font-medium leading-relaxed"
                                  >
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleConfirmAiPlan}
                            className="flex-1 nupul-pill-btn-green py-2.5 px-3 text-caption font-bold cursor-pointer"
                          >
                            确认使用
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiGeneratedPlan(null)}
                            className="flex-1 bg-white hover:bg-nupul-cream text-nupul-dark py-2.5 px-3 rounded-2xl border-2 border-nupul-dark text-caption font-bold cursor-pointer transition"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                  )}
                </div>
            </motion.div>
          )}

          {/* TAB 3: RESOURCE CENTER */}
          {activeTab === "resources" && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <SubPageNav
                items={[
                  { id: "browse", label: "资源浏览", icon: "search" },
                  { id: "sync", label: "平台同步", icon: "cloud" },
                ]}
                active={subResources}
                onChange={(id) => {
                  setSubResources(id);
                  setShowLocalUpload(false);
                  setShowResourcePreview(false);
                  setSelectedResource(null);
                }}
              />
              {subResources === "sync" && <PlatformSyncPanel />}
              {subResources === "browse" && showResourcePreview && (
                <ResourcePreviewPanel
                  resource={selectedResource}
                  onBack={() => {
                    setShowResourcePreview(false);
                    setSelectedResource(null);
                  }}
                />
              )}
              {subResources === "browse" && showLocalUpload && !showResourcePreview && (
                <LocalUploadPanel
                  onBack={() => setShowLocalUpload(false)}
                  onSubmit={handleUploadResource}
                  title={newResTitle}
                  onTitleChange={setNewResTitle}
                  resType={newResType}
                  onResTypeChange={setNewResType}
                  fileType={newResFileType}
                  onFileTypeChange={setNewResFileType}
                  successMsg={resSuccessMsg}
                />
              )}
              {subResources === "browse" && !showLocalUpload && !showResourcePreview && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-5 relative bg-nupul-cream p-6 rounded-3xl border-3 border-nupul-dark overflow-hidden">
                    {renderDiffuseAccents([
                      { corner: "bl", color: "green", inset: true, soft: true },
                      { dot: true, color: "yellow", soft: true, className: "top-4 right-4" },
                    ])}
                    <div className="relative z-10">
                    <h4 className="text-body font-bold text-nupul-dark">
                      照壁故事素材 · 快速上传
                    </h4>
                    <p className="text-caption text-nupul-dark/70 mt-2">
                      归档照壁故事课课件、AI主讲稿与课堂互动素材。
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLocalUpload(true);
                        setShowResourcePreview(false);
                        setSelectedResource(null);
                      }}
                      className="mt-4 w-full nupul-pill-btn-yellow py-2.5 text-caption font-black cursor-pointer"
                    >
                      前往上传通道 →
                    </button>
                    </div>
                  </div>
                  {/* Right column: resources lists table */}
                  <div className="lg:col-span-7 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-secondary font-bold text-nupul-dark">
                        美育数字资源中心
                      </h4>
                      <span className="text-caption bg-nupul-yellow text-nupul-dark font-bold border-2 border-nupul-dark py-0.5 px-3 rounded-full leading-none">
                        {resources.length} 项资源
                      </span>
                    </div>

                    {/* Scroll list of items */}
                    <div className="space-y-2 overflow-y-auto max-h-[420px] pr-2">
                      {resources.map((res) => (
                        <div
                          key={res.id}
                          className="bg-white p-3.5 rounded-2xl border-3 border-nupul-dark flex items-center justify-between gap-4 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            {/* File badge icon placeholder */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-nupul-dark ${
                                res.type === "platform"
                                  ? "bg-[#ff6b6b] text-white"
                                  : res.type === "core"
                                    ? "bg-nupul-green text-nupul-dark"
                                    : "bg-nupul-yellow text-nupul-dark"
                              }`}
                            >
                              <NupulIcon
                                name={
                                  res.fileType === "mp4"
                                    ? "video"
                                    : res.fileType === "svg"
                                      ? "pattern"
                                      : "course"
                                }
                                size="md"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <h6 className="text-caption font-bold text-nupul-dark/90 leading-snug">
                                {res.title}
                              </h6>
                              <div className="flex flex-wrap items-center gap-1.5 text-caption font-bold">
                                <span className="text-nupul-green-dark bg-[#eefbf0] border border-nupul-green-dark/20 px-1.5 py-0.5 rounded">
                                  {res.type === "platform"
                                    ? "国家统编"
                                    : res.type === "core"
                                      ? "特色核心非遗"
                                      : "校本自制物料"}
                                </span>
                                <span className="text-nupul-dark/40">•</span>
                                <span className="text-nupul-dark/55">
                                  {res.size}
                                </span>
                                <span className="text-nupul-dark/40">•</span>
                                <span className="text-nupul-dark/55">
                                  入档期：{res.date}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedResource(res);
                                setShowResourcePreview(true);
                                setShowLocalUpload(false);
                              }}
                              className="p-1 px-3 rounded-xl bg-nupul-cream hover:bg-[#fffdf7] text-caption font-bold border-2 border-nupul-dark transition-all active:translate-y-0.5 cursor-pointer"
                            >
                              预览
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: STUDENT WORKS MODERATION & BADGES */}
          {activeTab === "works" && (
            <motion.div
              key="works"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <SubPageNav
                items={[
                  {
                    id: "pending",
                    label: "作品批改",
                    icon: "favorites",
                    badge: String(
                      studentWorks.filter((w) => !w.approved).length,
                    ),
                  },
                  { id: "display", label: "作品展示", icon: "palette" },
                  { id: "report", label: "优秀周报", icon: "share" },
                ]}
                active={subWorks}
                onChange={(id) => {
                  setSubWorks(id);
                  setShowWorkReview(false);
                  setSelectedReviewWork(null);
                  setWorkReviewQuad("preview");
                }}
              />
              {subWorks === "display" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {TEACHER_DISPLAY_MODULES.map((label) => (
                      <span
                        key={label}
                        className="text-caption font-bold bg-nupul-yellow/30 border-2 border-nupul-dark px-3 py-1 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-secondary font-bold text-nupul-dark">
                    班级照壁展 · 已推报作品
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentWorks
                      .filter((w) => w.approved)
                      .map((work) => (
                        <div
                          key={work.id}
                          className="bg-white border-3 border-nupul-dark rounded-2xl overflow-hidden"
                        >
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            className="w-full aspect-video object-cover border-b-3 border-nupul-dark"
                          />
                          <div className="p-3 space-y-1">
                            <p className="text-caption font-bold text-nupul-dark truncate">
                              {work.title}
                            </p>
                            <p className="text-caption text-nupul-dark/60">
                              {work.studentName} · 学生故事卡
                            </p>
                            {work.badge && (
                              <span className="text-caption font-bold bg-nupul-green/20 text-nupul-green-dark px-2 py-0.5 rounded-full border border-nupul-green-dark/30">
                                {work.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    {studentWorks.filter((w) => w.approved).length === 0 && (
                      <p className="text-caption text-nupul-dark/60 col-span-full text-center py-8">
                        暂无已展出作品，请先在「作品批改」中推报学生佳作。
                      </p>
                    )}
                  </div>
                </div>
              )}
              {subWorks === "report" && (
                <ExportReportPanel
                  pending={studentWorks.filter((w) => !w.approved).length}
                  total={studentWorks.length}
                />
              )}
              {subWorks === "pending" && showWorkReview && (
                <>
                  <WorkReviewDetailPanel
                    work={selectedReviewWork}
                    quad={workReviewQuad}
                    onQuad={setWorkReviewQuad}
                    onBack={() => {
                      setShowWorkReview(false);
                      setSelectedReviewWork(null);
                      setWorkReviewQuad("preview");
                    }}
                    isApproved={
                      selectedReviewWork
                        ? isWorkApproved(selectedReviewWork)
                        : false
                    }
                    badges={badges}
                    selectedBadge={
                      selectedReviewWork
                        ? selectedBadgeMap[selectedReviewWork.id] || ""
                        : ""
                    }
                    onBadgeChange={(badge) => {
                      if (!selectedReviewWork) return;
                      setSelectedBadgeMap({
                        ...selectedBadgeMap,
                        [selectedReviewWork.id]: badge,
                      });
                    }}
                    onApprove={() => {
                      if (!selectedReviewWork) return;
                      handleApprove(selectedReviewWork.id);
                    }}
                    onUnpublish={() => {
                      if (!selectedReviewWork) return;
                      handleUnpublish(selectedReviewWork.id);
                    }}
                  />
                </>
              )}
              {subWorks === "pending" && !showWorkReview && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-secondary font-bold text-nupul-dark">
                      作品批改 · 学生投稿审批
                    </h4>
                    {TEACHER_REVIEW_CAPABILITIES.map((cap) => (
                      <span
                        key={cap}
                        className="text-caption font-bold text-nupul-dark/70 bg-nupul-cream border border-nupul-dark/20 px-2 py-0.5 rounded-full"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Waiting Reviews and Approved lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Outliner left list */}
                    <div className="lg:col-span-12 space-y-4">
                      {studentWorks.length === 0 ? (
                        <div className="relative text-center py-12 bg-nupul-cream border-3 border-nupul-dark rounded-3xl overflow-hidden">
                          {renderDiffuseAccents([
                            { corner: "bl", color: "green", inset: true, soft: true },
                            { dot: true, color: "yellow", soft: true, className: "top-6 right-6" },
                          ])}
                          <p className="relative z-10 text-caption text-nupul-dark/70 font-bold mt-2">
                            暂无需要审批的作品，前去学生端画一幅发上来吧！
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentWorks.map((work) => {
                            const isApprovedLocally = isWorkApproved(work);
                            return (
                              <div
                                key={work.id}
                                className={`p-5 rounded-2xl border-3 border-nupul-dark transition-all grid grid-cols-1 md:grid-cols-12 gap-5 items-center ${
                                  isApprovedLocally
                                    ? "bg-nupul-cream/50 border-nupul-dark/30 opacity-85"
                                    : "bg-white transition-all"
                                }`}
                              >
                                {/* Graphic view styled like a custom picture frame */}
                                <div className="md:col-span-3 aspect-video rounded-xl bg-slate-100 overflow-hidden border-2 border-nupul-dark">
                                  <img
                                    src={work.imageUrl}
                                    alt={work.title}
                                    className="vector-illustration w-full h-full object-cover shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>

                                {/* Details text */}
                                <div className="md:col-span-5 space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-caption font-bold rounded-full border-2 px-2.5 py-0.5 leading-none ${
                                        isApprovedLocally
                                          ? "bg-nupul-cream text-nupul-dark/50 border-nupul-dark/20"
                                          : "bg-nupul-yellow text-nupul-dark border-nupul-dark"
                                      }`}
                                    >
                                      {isApprovedLocally
                                        ? "已推报线上长廊"
                                        : "等待徐海明老师推报"}
                                    </span>
                                    <span className="text-caption font-bold text-nupul-green-dark bg-[#eefbf0] border border-nupul-green-dark/20 px-2 py-0.5 rounded">
                                      {work.grade} // {work.studentName} 同学
                                    </span>
                                  </div>

                                  <h5 className="text-secondary font-bold text-nupul-dark">
                                    {work.title}
                                  </h5>

                                  <p className="text-caption text-nupul-dark/80 bg-nupul-cream/60 p-2.5 rounded-xl border-2 border-stone-800/5 leading-relaxed font-medium italic block">
                                    <strong>学习日记:</strong> “ {work.diary}{" "}
                                    ”
                                  </p>
                                </div>

                                {/* Actions block */}
                                <div className="md:col-span-4 flex flex-col justify-center space-y-2.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReviewWork(work);
                                      setShowWorkReview(true);
                                      setWorkReviewQuad("preview");
                                    }}
                                    className="w-full p-2 px-3 rounded-xl bg-nupul-cream hover:bg-[#fffdf7] text-caption font-bold border-2 border-nupul-dark transition-all active:translate-y-0.5 cursor-pointer"
                                  >
                                    查看作品
                                  </button>
                                  {isApprovedLocally ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleUnpublish(work.id)}
                                        className="w-full p-2 px-3 rounded-xl bg-white hover:bg-red-50 text-caption font-bold border-2 border-[#c53030] text-[#c53030] transition-all active:translate-y-0.5 cursor-pointer"
                                      >
                                        下架作品
                                      </button>
                                      <div className="text-right space-y-1 pr-1 font-bold">
                                        <div className="text-caption text-nupul-green-dark flex items-center justify-end space-x-1 leading-none">
                                          <span>推报成功 · 馆藏已归档</span>
                                        </div>
                                        <span className="text-caption text-nupul-dark/60 block pt-1">
                                          所获荣誉：
                                          {work.badge ||
                                            selectedBadgeMap[work.id] ||
                                            "非物质文化传承之星"}
                                        </span>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {lessonPresentCourse && (
          <LessonPptOverlay
            key={lessonPresentCourse.id}
            course={lessonPresentCourse}
            slides={lessonPresentSlides ?? undefined}
            onClose={closeLessonPpt}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
