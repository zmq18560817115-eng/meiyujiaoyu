import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { DEFAULT_STUDENTS, DEFAULT_TEACHERS } from "../data/accounts";
import { BrandLogo } from "./shared/BrandLogo";
import { BackButtonLabel, NupulIcon } from "./icons";
import { Role } from "../types";
import { api, setAuthToken } from "../api/client";
import {
  DIFFUSE_PRESETS,
  renderDiffuseAccents,
} from "./ui/DiffuseDecor";

export type RoleSelectMeta = {
  teacherName?: string;
  teacher?: {
    workId: string;
    school?: string;
    title?: string;
  };
  student?: { name: string; grade: string };
};

interface RoleSelectionProps {
  onSelectRole: (role: Role, meta?: RoleSelectMeta) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onSelectRole,
}) => {
  const [currentPage, setCurrentPage] = useState<
    "welcome" | "teacher_login" | "student_login"
  >("welcome");
  const [workId, setWorkId] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("stu-01");
  const [studentPassword, setStudentPassword] = useState("stu123");
  const [studentClass, setStudentClass] = useState("g4-1");
  const [errorMsg, setErrorMsg] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [pressedLauncher, setPressedLauncher] = useState<
    "teacher" | "student" | null
  >(null);

  const launcherPressProps = (id: "teacher" | "student") => ({
    onPointerDown: () => setPressedLauncher(id),
    onPointerUp: () => setPressedLauncher(null),
    onPointerLeave: () => setPressedLauncher(null),
    onPointerCancel: () => setPressedLauncher(null),
  });

  const classStudents = useMemo(
    () => DEFAULT_STUDENTS.filter((s) => s.classCode === studentClass),
    [studentClass],
  );

  const isDev = import.meta.env.DEV;
  const devTeacher = DEFAULT_TEACHERS[0];
  const devStudent = DEFAULT_STUDENTS[0];

  const loginTeacher = async (id: string, pwd: string) => {
    setLoggingIn(true);
    setErrorMsg("");
    try {
      const { token, teacher } = await api.auth.teacherLogin(id, pwd);
      setAuthToken(token, "teacher");
      const roster = DEFAULT_TEACHERS.find((t) => t.workId === teacher.workId);
      onSelectRole("teacher", {
        teacherName: teacher.name,
        teacher: {
          workId: teacher.workId,
          school: roster?.school,
          title: roster?.title,
        },
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoggingIn(false);
    }
  };

  const loginStudent = async (
    sid: string,
    classCode: string,
    pwd: string,
  ) => {
    setLoggingIn(true);
    setErrorMsg("");
    try {
      const { token, student } = await api.auth.studentLogin({
        studentId: sid,
        classCode,
        password: pwd,
      });
      setAuthToken(token, "student");
      onSelectRole("student", {
        student: { name: student.name, grade: student.grade },
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workId.trim()) {
      setErrorMsg("请输入教师工号");
      return;
    }
    await loginTeacher(workId.trim(), password || "demo123");
  };

  return (
    <div className="min-h-screen nupul-split-header flex flex-col justify-between select-none relative overflow-x-hidden">

      {/* Primary Sticky-style Header Row */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 lg:pt-5 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 bg-white px-4 py-2 rounded-full border-3 border-nupul-dark">
            <BrandLogo size="sm" className="shrink-0" />
            <div>
              <h1 className="font-bold text-body text-nupul-dark tracking-wider leading-none">
                青墙粉绘
              </h1>
              <span className="text-caption font-mono tracking-widest text-nupul-green-dark font-bold block leading-none mt-1">
                DALI FOLK HOUSE AESTHETICS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] sm:text-caption bg-[#fef8e8] text-nupul-dark px-3 py-1.5 border-3 border-nupul-dark rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-nupul-green border-2 border-nupul-dark animate-pulse shrink-0"></span>
            <span className="font-black">
              双廊小学示范点 · 离线美育赋能系统
            </span>
          </div>
        </div>
      </header>

      {/* Main body of launcher */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center py-4 lg:py-6 px-4 sm:px-6 z-10">
        {currentPage === "welcome" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="role-welcome-shell w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 xl:gap-8 items-center"
          >
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 lg:space-y-4">
              <h2 className="text-[1.625rem] sm:text-[1.75rem] lg:text-[1.875rem] xl:text-[2rem] font-bold text-nupul-dark leading-snug tracking-tight">
                壁画青墙
                <span className="block text-[1.25rem] sm:text-[1.35rem] lg:text-[1.5rem] font-bold text-nupul-green-dark mt-1.5 lg:mt-2">
                  粉绘非遗研学舱
                </span>
              </h2>
              <p className="text-caption sm:text-secondary text-nupul-dark/75 leading-relaxed max-w-sm lg:max-w-none">
                融合 3D 照壁漫游全景与手捏结辫扎染植物活化，大理民间工坊自主设计的童趣交互平台。让白族吉祥飞蝶与苍莹石青，在孩子们纯真探索中传承出新！
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 w-full">
              {/* Teacher Portal Box */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCurrentPage("teacher_login")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentPage("teacher_login");
                  }
                }}
                {...launcherPressProps("teacher")}
                className={`nupul-launcher-card p-4 sm:p-5 flex flex-col justify-between space-y-4 relative group ${
                  pressedLauncher === "teacher" ? "is-pressed" : ""
                }`}
              >
                {renderDiffuseAccents(DIFFUSE_PRESETS.welcomeTeacher)}

                <div className="space-y-3">
                  <div className="nupul-launcher-icon w-10 h-10 bg-nupul-yellow border-3 border-nupul-dark rounded-xl flex items-center justify-center text-nupul-dark font-bold text-secondary">
                    师
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-caption bg-nupul-yellow text-nupul-dark font-bold px-2 py-0.5 rounded-full border-2 border-nupul-dark">
                      教师工作台 · TEACHER MODE
                    </span>
                    <h3 className="text-secondary sm:text-body font-bold mt-2 text-nupul-dark leading-snug">
                      乡村美育人机智能化授课平台
                    </h3>
                  </div>
                  <ul className="space-y-1.5 text-[12px] sm:text-caption text-nupul-dark/90 font-medium">
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>AI 一键设计非遗特色主题微课件</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>学生彩绘线稿智能白画打分及归档</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>3D 全景投屏与智慧白板协同授课</span>
                    </li>
                  </ul>
                </div>

                <div className="nupul-launcher-cta w-full mt-1 nupul-pill-btn-yellow py-2.5 px-3 flex items-center justify-center text-caption font-bold">
                  <span>授课登录 · 智能备课台</span>
                </div>
              </div>

              {/* Student Portal Box */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCurrentPage("student_login")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentPage("student_login");
                  }
                }}
                {...launcherPressProps("student")}
                className={`nupul-launcher-card p-4 sm:p-5 flex flex-col justify-between space-y-4 relative group ${
                  pressedLauncher === "student" ? "is-pressed" : ""
                }`}
              >
                {renderDiffuseAccents(DIFFUSE_PRESETS.welcomeStudent)}

                <div className="space-y-3">
                  <div className="nupul-launcher-icon w-10 h-10 bg-nupul-green border-3 border-nupul-dark rounded-xl flex items-center justify-center text-nupul-dark">
                    <NupulIcon name="user" size="md" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-caption bg-nupul-green text-white font-bold px-2 py-0.5 rounded-full border-2 border-nupul-dark">
                      研学体验舱 · STUDENT MODE
                    </span>
                    <h3 className="text-secondary sm:text-body font-bold mt-2 text-nupul-dark leading-snug">
                      大理非遗植物扎染玩学体验
                    </h3>
                  </div>
                  <ul className="space-y-1.5 text-[12px] sm:text-caption text-nupul-dark/90 font-medium">
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>3D自然彩绘：喜洲民居画影壁实景</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>一键智能大师配色，墨迹扎染纸上开花</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-nupul-green-dark font-bold text-secondary">
                        ·
                      </span>
                      <span>「小草」伴读与智库对话素材库，探索非遗奥秘</span>
                    </li>
                  </ul>
                </div>

                <div className="nupul-launcher-cta w-full mt-1 nupul-pill-btn-green py-2.5 px-3 flex items-center justify-center text-caption font-bold">
                  <span>学生登录 · 开启传统美育</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : currentPage === "student_login" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: loggingIn ? 0.72 : 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md nupul-tactile-card bg-white p-8 relative mt-4 overflow-visible"
          >
            {loggingIn && (
              <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-[#fff9ee]/55 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.span
                  className="text-caption font-bold text-nupul-green-dark bg-white/90 border-2 border-nupul-dark px-4 py-2 rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                >
                  白族少女正奔向研学舱…
                </motion.span>
              </motion.div>
            )}
            {renderDiffuseAccents(DIFFUSE_PRESETS.loginStudent)}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-nupul-green text-white border-3 border-nupul-dark px-5 py-2.5 rounded-full font-bold text-caption tracking-widest z-10">
              学生研学登录
            </div>

            <div className="text-center mt-4 mb-6">
              <h3 className="text-display-md font-bold text-nupul-dark">
                班级名册登录
              </h3>
              <p className="text-caption text-nupul-dark/60 mt-1 font-medium">
                请选择班级与学生身份后进入研学舱
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!studentId) {
                  setErrorMsg("请选择学生");
                  return;
                }
                await loginStudent(studentId, studentClass, studentPassword);
              }}
              className="space-y-4"
            >
              {isDev && (
                <button
                  type="button"
                  disabled={loggingIn}
                  onClick={() =>
                    loginStudent(
                      devStudent.id,
                      devStudent.classCode,
                      devStudent.password,
                    )
                  }
                  className="w-full bg-nupul-green/15 hover:bg-nupul-green/25 text-nupul-green-dark border-2 border-dashed border-nupul-green-dark/40 rounded-2xl py-3 px-4 text-caption font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loggingIn
                    ? "进入中…"
                    : `测试快捷登录 · ${devStudent.name}（${devStudent.grade}）`}
                </button>
              )}

              <div>
                <label className="block text-caption font-bold text-nupul-dark mb-1.5 ml-1">
                  班级
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => {
                    const code = e.target.value;
                    setStudentClass(code);
                    const first = DEFAULT_STUDENTS.find(
                      (s) => s.classCode === code,
                    );
                    if (first) setStudentId(first.id);
                  }}
                  className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-3 px-4 text-caption font-semibold focus:outline-none text-nupul-dark"
                >
                  <option value="g3-2">三年级 2班</option>
                  <option value="g4-1">四年级 1班</option>
                  <option value="g4-2">四年级 2班</option>
                  <option value="g5-1">五年级 1班</option>
                </select>
              </div>
              <div>
                <label className="block text-caption font-bold text-nupul-dark mb-1.5 ml-1">
                  学生（名册）
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-3 px-4 text-caption font-semibold focus:outline-none text-nupul-dark"
                  required
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-caption font-bold text-nupul-dark mb-1.5 ml-1">
                  学生密码
                </label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-3 px-4 text-caption font-semibold focus:outline-none text-nupul-dark"
                  placeholder="stu123"
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-caption text-nupul-orange font-bold bg-nupul-orange/10 border border-nupul-orange/25 py-1.5 px-3 rounded-lg">
                  {errorMsg}
                </p>
              )}

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("welcome");
                    setErrorMsg("");
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 text-nupul-dark font-bold text-caption py-3 rounded-2xl border-3 border-nupul-dark cursor-pointer"
                >
                  <BackButtonLabel label="返回主页" />
                </button>
                <button
                  type="submit"
                  className="flex-1 nupul-pill-btn-green py-3 text-caption font-bold cursor-pointer"
                >
                  {loggingIn ? "进入中…" : "进入研学舱"}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Teacher log-in board */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: loggingIn ? 0.72 : 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md nupul-tactile-card bg-white p-8 relative mt-4 overflow-visible"
          >
            {loggingIn && (
              <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-[#fff9ee]/55 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.span
                  className="text-caption font-bold text-nupul-green-dark bg-white/90 border-2 border-nupul-dark px-4 py-2 rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                >
                  正在打开美育工作台…
                </motion.span>
              </motion.div>
            )}
            {renderDiffuseAccents(DIFFUSE_PRESETS.loginTeacher)}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-nupul-yellow text-nupul-dark border-3 border-nupul-dark px-5 py-2.5 rounded-full font-bold text-caption tracking-widest z-10">
              乡村教师验证入口
            </div>

            <div className="text-center mt-4 mb-6">
              <h3 className="text-display-md font-bold text-nupul-dark">
                教师账号登录
              </h3>
              <p className="text-caption text-nupul-dark/60 mt-1 font-medium">
                请输入学校发放的工号与密码
              </p>
            </div>

            <form onSubmit={handleTeacherLogin} className="space-y-4">
              {isDev && (
                <button
                  type="button"
                  disabled={loggingIn}
                  onClick={() =>
                    loginTeacher(devTeacher.workId, devTeacher.password)
                  }
                  className="w-full bg-nupul-yellow/25 hover:bg-nupul-yellow/40 text-nupul-dark border-2 border-dashed border-nupul-dark/35 rounded-2xl py-3 px-4 text-caption font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loggingIn
                    ? "登录中…"
                    : `测试快捷登录 · ${devTeacher.name}老师（${devTeacher.workId}）`}
                </button>
              )}

              <div>
                <label className="block text-caption font-bold text-nupul-dark mb-1.5 ml-1">
                  授课人工号 / ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={workId}
                    onChange={(e) => setWorkId(e.target.value)}
                    className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-3 px-4 text-caption font-semibold focus:outline-none focus:bg-white text-nupul-dark placeholder-nupul-dark/40"
                    placeholder="例如: SL-1008"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-nupul-dark mb-1.5 ml-1">
                  安全密码 / PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-nupul-cream border-3 border-nupul-dark rounded-2xl py-3 px-4 text-caption font-semibold focus:outline-none focus:bg-white text-nupul-dark placeholder-nupul-dark/40"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-caption text-nupul-orange font-bold bg-nupul-orange/10 border border-nupul-orange/25 py-1.5 px-3 rounded-lg">
                  {errorMsg}
                </p>
              )}

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("welcome");
                    setErrorMsg("");
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 text-nupul-dark font-bold text-caption py-3 rounded-2xl border-3 border-nupul-dark active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <BackButtonLabel label="返回主页" />
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-nupul-yellow hover:bg-nupul-yellow text-nupul-dark font-bold text-caption py-3 rounded-2xl border-3 border-nupul-dark active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>{loggingIn ? "登录中…" : "立即登入"}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t-2 border-nupul-dark/15 text-center text-caption text-nupul-dark/50 leading-relaxed font-bold">
              大理非物质文化遗产保护局 · 特别示范工作包
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-caption text-nupul-dark/50 font-bold border-t-2 border-nupul-dark/10 py-4 px-4 sm:px-6 mt-4 z-10">
        <div>
          <span>© 2026 云南大理双廊中心小学美育课题组. </span>
          <span className="hidden sm:inline">
            数字化 AI 保护和扎染民俗课堂创学体验系统。
          </span>
        </div>
        <div className="flex space-x-3 mt-2 sm:mt-0 font-mono text-caption">
          <span>DEV: PORT 3000</span>
          <span>•</span>
          <span>MODEL: GEMINI 1.5 PRO</span>
          <span>•</span>
          <span>LOCAL STATIC PERSISTENCE</span>
        </div>
      </footer>
    </div>
  );
};
