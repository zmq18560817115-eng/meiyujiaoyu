/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { RoleSelection } from "./components/RoleSelection";
import {
  StudentMainNav,
  TeacherMainNav,
  type StudentMainTab,
  type TeacherMainTab,
} from "./components/shared/MainPortalNav";
import { PortalTopBar } from "./components/shared/PortalTopBar";
import { UserAccountMenu } from "./components/shared/UserAccountMenu";
import { NoticesInbox } from "./components/teacher/NoticesInbox";
import { DEFAULT_STUDENTS, DEFAULT_TEACHERS } from "./data/accounts";
import { StudentPortal } from "./components/StudentPortal";
import { TeacherPortal } from "./components/TeacherPortal";
import {
  Role,
  Course,
  Resource,
  StudentArtwork,
  StudentProgressStats,
  Announcement,
  ScheduleItem,
} from "./types";
import { MOCK_STUDENTS_PROGRESS } from "./data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { api, clearAllTokens, getAuthToken, setAuthToken } from "./api/client";
import { useResourceCache } from "./context/ResourceCacheContext";
import { PortalEntryLoader } from "./components/PortalEntryLoader";
import {
  HomeSplashIntro,
  markHomeSplashSeen,
  shouldShowHomeSplash,
} from "./components/HomeSplashIntro";

const defaultStats: StudentProgressStats = MOCK_STUDENTS_PROGRESS;

function AppContent() {
  const {
    cachedItems,
    pendingCacheCount,
    avatarPulse,
    clearPendingCache,
    openLocalCacheFolder,
    folderPath,
  } = useResourceCache();
  const [role, setRole] = useState<Role>("welcome");
  const [teacherMainTab, setTeacherMainTab] = useState<TeacherMainTab>("home");
  const [studentMainTab, setStudentMainTab] = useState<StudentMainTab>("view3d");
  const [teacherName, setTeacherName] = useState("徐海明");
  const [teacherProfile, setTeacherProfile] = useState<{
    workId?: string;
    school?: string;
    title?: string;
  }>(() => {
    const t = DEFAULT_TEACHERS.find((x) => x.name === "徐海明");
    return { workId: t?.workId, school: t?.school, title: t?.title };
  });
  const [studentProfile, setStudentProfile] = useState<{
    name: string;
    grade: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [appScreen, setAppScreen] = useState<
    "welcome" | "entry-loading" | "portal"
  >("welcome");
  const [showHomeSplash, setShowHomeSplash] = useState(shouldShowHomeSplash);
  const [entryLoaderExiting, setEntryLoaderExiting] = useState(false);
  const [entryBoot, setEntryBoot] = useState<{
    role: "teacher" | "student";
    displayName: string;
    tagline?: string;
  } | null>(null);
  const portalBootSessionRef = useRef(0);

  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [studentWorks, setStudentWorks] = useState<StudentArtwork[]>([]);
  const [galleryWorks, setGalleryWorks] = useState<StudentArtwork[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState<
    StudentProgressStats & { prideScore?: number }
  >(defaultStats);
  const [dashboard, setDashboard] = useState<{
    pendingReviews: number;
    prideScore: number;
    galleryCount: number;
  } | null>(null);
  const [noticesInboxOpen, setNoticesInboxOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(
    () => new Set(),
  );

  const openNoticesInbox = useCallback((noticeId?: string) => {
    setSelectedNoticeId(noticeId ?? null);
    setTeacherMainTab("home");
    // 延迟打开，避免菜单项同一次 click 冒泡到遮罩导致侧栏闪退
    window.setTimeout(() => setNoticesInboxOpen(true), 0);
  }, []);

  const markNoticeRead = (id: string) => {
    setReadNoticeIds((prev) => new Set(prev).add(id));
  };

  const markAllNoticesRead = () => {
    setReadNoticeIds(new Set(announcements.map((a) => a.id)));
  };

  const refreshTeacher = useCallback(async () => {
    setLoading(true);
    try {
      const [boot, dash] = await Promise.all([
        api.bootstrap.teacher(),
        api.dashboard.teacher().catch(() => null),
      ]);
      setCourses(boot.courses);
      setResources(boot.resources);
      setStudentWorks(boot.artworks);
      setAnnouncements(boot.announcements);
      setSchedules(boot.schedules as ScheduleItem[]);
      setStats({ ...boot.stats, prideScore: boot.stats.prideScore });
      if (dash) {
        setDashboard({
          pendingReviews: dash.pendingReviews,
          prideScore: dash.prideScore,
          galleryCount: dash.galleryCount,
        });
        setStats((prev) => ({
          ...prev,
          activeStudents: dash.activeStudents,
          completionRate: dash.completionRate,
          totalWorks: dash.totalWorks,
        }));
      }
    } catch (e) {
      console.error("教师端数据加载失败", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStudent = useCallback(async () => {
    setLoading(true);
    try {
      const boot = await api.bootstrap.student();
      setGalleryWorks(boot.artworks);
    } catch (e) {
      console.error("学生端数据加载失败", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectRole = (
    selectedRole: Role,
    meta?: {
      teacherName?: string;
      teacher?: { workId: string; school?: string; title?: string };
      student?: { name: string; grade: string };
    },
  ) => {
    const session = portalBootSessionRef.current + 1;
    portalBootSessionRef.current = session;
    const displayName =
      meta?.teacherName ??
      meta?.student?.name ??
      (selectedRole === "teacher" ? "老师" : "同学");
    const tagline =
      selectedRole === "student"
        ? meta?.student?.grade
        : [meta?.teacher?.school, meta?.teacher?.title]
            .filter(Boolean)
            .join(" · ") || undefined;

    flushSync(() => {
      setRole(selectedRole);
      setEntryLoaderExiting(false);
      setEntryBoot({
        role: selectedRole as "teacher" | "student",
        displayName,
        tagline,
      });
      setAppScreen("entry-loading");
      if (meta?.teacherName) setTeacherName(meta.teacherName);
      if (meta?.teacher) setTeacherProfile(meta.teacher);
      if (meta?.student) setStudentProfile(meta.student);
    });
    if (selectedRole === "teacher") {
      setTeacherMainTab("home");
    }
    if (selectedRole === "student") {
      setStudentMainTab("view3d");
    }

    const bootMs = 2800;
    const minDisplay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, bootMs);
    });
    const load =
      selectedRole === "teacher" ? refreshTeacher() : refreshStudent();
    Promise.all([minDisplay, load]).finally(() => {
      if (portalBootSessionRef.current === session) {
        setAppScreen("portal");
        setEntryLoaderExiting(true);
      }
    });
  };

  const handleLogout = () => {
    api.auth.logout().catch(() => {});
    clearAllTokens();
    setStudentProfile(null);
    setEntryLoaderExiting(false);
    setEntryBoot(null);
    setAppScreen("welcome");
    setRole("welcome");
  };

  const ensureTeacherSession = useCallback(async () => {
    if (getAuthToken("teacher")) return;
    const fallback =
      DEFAULT_TEACHERS.find((t) => t.workId === teacherProfile.workId) ??
      DEFAULT_TEACHERS[0];
    const { token, teacher } = await api.auth.teacherLogin(
      fallback.workId,
      fallback.password,
    );
    setAuthToken(token, "teacher");
    const roster = DEFAULT_TEACHERS.find((t) => t.workId === teacher.workId);
    setTeacherName(teacher.name);
    setTeacherProfile({
      workId: teacher.workId,
      school: roster?.school,
      title: roster?.title,
    });
  }, [teacherProfile.workId]);

  const ensureStudentSession = useCallback(async () => {
    if (getAuthToken("student") && studentProfile) return;
    const fallback =
      DEFAULT_STUDENTS.find((s) => s.name === studentProfile?.name) ??
      DEFAULT_STUDENTS[0];
    const { token, student } = await api.auth.studentLogin({
      studentId: fallback.id,
      classCode: fallback.classCode,
      password: fallback.password,
    });
    setAuthToken(token, "student");
    setStudentProfile({ name: student.name, grade: student.grade });
  }, [studentProfile]);

  const handleSwitchRole = useCallback(async () => {
    const target: "teacher" | "student" =
      role === "teacher" ? "student" : "teacher";
    setLoading(true);
    try {
      if (target === "student") {
        await ensureStudentSession();
        setRole("student");
        setStudentMainTab("view3d");
        await refreshStudent();
      } else {
        await ensureTeacherSession();
        setRole("teacher");
        setTeacherMainTab("home");
        await refreshTeacher();
      }
    } catch (e) {
      console.error("端切换失败", e);
      alert("切换失败，请从欢迎页重新登录");
    } finally {
      setLoading(false);
    }
  }, [
    role,
    ensureStudentSession,
    ensureTeacherSession,
    refreshStudent,
    refreshTeacher,
  ]);

  const entryLoader = entryBoot ? (
    <PortalEntryLoader
      key={`${entryBoot.role}-${entryBoot.displayName}`}
      role={entryBoot.role}
      displayName={entryBoot.displayName}
      tagline={entryBoot.tagline}
      durationMs={2800}
      exiting={entryLoaderExiting}
      onExitComplete={() => {
        setEntryLoaderExiting(false);
        setEntryBoot(null);
      }}
    />
  ) : null;

  const completeHomeSplash = useCallback(() => {
    markHomeSplashSeen();
    setShowHomeSplash(false);
  }, []);

  return (
    <>
      {appScreen === "welcome" && showHomeSplash && (
        <HomeSplashIntro onComplete={completeHomeSplash} />
      )}
      {appScreen === "entry-loading" && !entryBoot && (
        <div
          className="fixed inset-0 z-[299] bg-[#fff9ee] flex items-center justify-center"
          aria-busy
        >
          <p className="text-caption font-bold text-nupul-dark/60">
            正在进入…
          </p>
        </div>
      )}
      {entryLoader}
      {appScreen !== "entry-loading" && (
        <motion.div
          className="min-h-screen nupul-flat-stage"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {appScreen === "welcome" ? (
            <motion.div
              initial={false}
              animate={{
                opacity: showHomeSplash ? 0 : 1,
                filter: showHomeSplash ? "blur(6px)" : "blur(0px)",
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden={showHomeSplash}
            >
              <RoleSelection onSelectRole={handleSelectRole} />
            </motion.div>
          ) : (
        <motion.div
          className="h-dvh max-h-dvh min-h-0 flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 18, scale: 0.992 }}
          animate={{
            opacity: entryLoaderExiting ? 0.92 : 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: entryLoaderExiting ? 0.55 : 0.72,
            ease: [0.22, 1, 0.36, 1],
            delay: entryLoaderExiting ? 0 : 0.08,
          }}
        >
          <PortalTopBar
            onLogoClick={handleLogout}
            nav={
              role === "teacher" ? (
                <TeacherMainNav
                  activeTab={teacherMainTab}
                  onChange={setTeacherMainTab}
                  pendingWorks={studentWorks.filter((w) => !w.approved).length}
                />
              ) : (
                <StudentMainNav
                  activeTab={studentMainTab}
                  onChange={setStudentMainTab}
                />
              )
            }
            actions={
              <UserAccountMenu
                role={role === "teacher" ? "teacher" : "student"}
                teacher={{
                  name: teacherName,
                  workId: teacherProfile.workId,
                  school: teacherProfile.school,
                  title: teacherProfile.title,
                }}
                student={studentProfile}
                loading={loading}
                onLogout={handleLogout}
                onOpenNotifications={
                  role === "teacher" ? openNoticesInbox : undefined
                }
                cachedItems={
                  role === "teacher" ? cachedItems : undefined
                }
                pendingCacheCount={
                  role === "teacher" ? pendingCacheCount : undefined
                }
                avatarPulse={role === "teacher" ? avatarPulse : undefined}
                cacheFolderPath={
                  role === "teacher" ? folderPath : undefined
                }
                onOpenLocalCacheFolder={
                  role === "teacher" ? openLocalCacheFolder : undefined
                }
                onClearPendingCache={
                  role === "teacher" ? clearPendingCache : undefined
                }
                onSwitchRole={
                  appScreen === "portal" ? handleSwitchRole : undefined
                }
              />
            }
          />

          {role === "teacher" && (
            <NoticesInbox
              open={noticesInboxOpen}
              announcements={announcements}
              readIds={readNoticeIds}
              selectedId={selectedNoticeId}
              onClose={() => setNoticesInboxOpen(false)}
              onSelect={setSelectedNoticeId}
              onMarkRead={markNoticeRead}
              onMarkAllRead={markAllNoticesRead}
            />
          )}

          <main className="flex-1 py-1.5 md:py-2 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {role === "student" ? (
                <motion.div
                  key="student-portal-wrapper"
                  className="h-full min-h-0 flex flex-col"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                >
                  <StudentPortal
                    activeTab={studentMainTab}
                    onActiveTabChange={setStudentMainTab}
                    galleryWorks={galleryWorks}
                    studentProfile={studentProfile}
                    onRefreshGallery={refreshStudent}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="teacher-portal-wrapper"
                  className="h-full min-h-0 flex flex-col"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                >
                  <TeacherPortal
                    activeTab={teacherMainTab}
                    onActiveTabChange={setTeacherMainTab}
                    teacherName={teacherName}
                    courses={courses}
                    resources={resources}
                    studentWorks={studentWorks}
                    stats={stats}
                    announcements={announcements}
                    schedules={schedules}
                    dashboard={dashboard}
                    onRefresh={refreshTeacher}
                    readNoticeIds={readNoticeIds}
                    onOpenNoticesInbox={openNoticesInbox}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="shrink-0 bg-white border-t-2 border-nupul-dark py-2 md:py-2.5 text-center text-[11px] md:text-caption text-nupul-dark/60">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 font-bold">
              <span>
                云南大理双廊中心小学美育课题组 · 数字化非遗进校园试点
              </span>
              <span className="text-caption font-mono tracking-wider text-nupul-green-dark uppercase mt-1 md:mt-0">
                DALI CENTENNIAL SCHOOL EDUCATION PROJECT
              </span>
            </div>
          </footer>
        </motion.div>
          )}
        </motion.div>
      )}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
