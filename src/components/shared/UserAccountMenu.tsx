import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { UserAvatarCircle } from "./UserAvatarCircle";
import { NupulIcon } from "../icons";
import type { CachedResource } from "../../context/ResourceCacheContext";
import { TEACHER_AVATAR_ANCHOR_ID } from "../../context/ResourceCacheContext";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

function ChevronRight() {
  return (
    <svg
      className="w-3.5 h-3.5 text-nupul-dark/35 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuRow(props: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}) {
  const { item, onSelect } = props;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
        item.danger
          ? "text-nupul-dark hover:bg-nupul-cream"
          : "text-nupul-dark hover:bg-nupul-soft-green/25",
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center shrink-0 text-nupul-dark/70">
        {item.icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-secondary font-semibold block leading-snug">
          {item.label}
        </span>
      </span>
      {!item.danger && <ChevronRight />}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-nupul-dark/10 mx-3" role="separator" />;
}

export type TeacherProfileInfo = {
  name: string;
  workId?: string;
  school?: string;
  title?: string;
};

export type StudentProfileInfo = {
  name: string;
  grade?: string;
};

interface UserAccountMenuProps {
  role: "teacher" | "student";
  teacher?: TeacherProfileInfo;
  student?: StudentProfileInfo | null;
  loading?: boolean;
  onLogout: () => void;
  /** 教师端：打开校园通知接收中心 */
  onOpenNotifications?: (noticeId?: string) => void;
  /** 教师端：本地资源缓存 */
  cachedItems?: CachedResource[];
  pendingCacheCount?: number;
  avatarPulse?: boolean;
  cacheFolderPath?: string;
  onOpenLocalCacheFolder?: () => void;
  onClearPendingCache?: () => void;
  /** 演示：教师 ↔ 学生端切换 */
  onSwitchRole?: () => void;
}

function ResourceSyncPanel(props: {
  items: CachedResource[];
  folderPath: string;
  onOpenFolder: () => void;
}) {
  const { items, folderPath, onOpenFolder } = props;
  return (
    <div className="px-4 py-3 space-y-3">
      <div>
        <p className="text-caption font-bold text-nupul-dark">资源同步与缓存</p>
        <p className="text-caption text-nupul-dark/70 font-semibold mt-1.5 leading-relaxed">
          资源库素材与班级周报已同步至本地缓存节点，可在下方打开文件夹查看。
        </p>
      </div>
      <div className="rounded-xl border-2 border-nupul-dark/15 bg-white px-3 py-2.5">
        <p className="text-caption font-bold text-nupul-dark/50 uppercase tracking-wider">
          本地路径
        </p>
        <p className="text-caption font-mono text-nupul-green-dark font-bold mt-1 break-all">
          {folderPath}
        </p>
      </div>
      {items.length > 0 ? (
        <ul className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
          {items.slice(0, 8).map((item) => (
            <li
              key={`${item.id}-${item.savedAt}`}
              className="flex items-center gap-2 text-caption font-semibold text-nupul-dark/80 bg-nupul-soft-green/20 rounded-lg px-2.5 py-1.5"
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center text-nupul-green-dark">
                <NupulIcon name="cloud" size="sm" />
              </span>
              <span className="flex-1 min-w-0 truncate">{item.title}</span>
              <span className="text-nupul-dark/40 font-mono text-[10px] shrink-0">
                .{item.fileType}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption text-nupul-dark/55 font-semibold">
          暂无缓存资源，请先在资源库下载或班级周报导出到本地。
        </p>
      )}
      <button
        type="button"
        onClick={onOpenFolder}
        className="w-full nupul-pill-btn-green py-2.5 text-caption font-black cursor-pointer"
      >
        打开本地文件夹
      </button>
    </div>
  );
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  role,
  teacher,
  student,
  loading = false,
  onLogout,
  onOpenNotifications,
  cachedItems = [],
  pendingCacheCount = 0,
  avatarPulse = false,
  cacheFolderPath = "~/Downloads/青墙粉绘-资源缓存",
  onOpenLocalCacheFolder,
  onClearPendingCache,
  onSwitchRole,
}) => {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    right: number;
    width: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const anchor = rootRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 32, 320);
    setMenuStyle({
      top: rect.bottom + 8,
      right: Math.max(16, window.innerWidth - rect.right),
      width,
    });
  }, []);

  const displayName =
    role === "teacher" ? (teacher?.name ?? "教师") : (student?.name ?? "学生");
  const roleLabel = role === "teacher" ? "教师端 · 已登录" : "学生端 · 已登录";
  const subtitle =
    role === "teacher"
      ? [teacher?.school, teacher?.title].filter(Boolean).join(" · ")
      : (student?.grade ?? "彩绘研学舱");

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setActivePanel(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setActivePanel(null);
      }
    };
    const onLayoutChange = () => updateMenuPosition();

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange, true);
    };
  }, [open, updateMenuPosition]);

  const settingsItems: MenuItem[] = [
    {
      id: "notify",
      label: "通知与消息偏好",
      icon: <NupulIcon name="notifications" size="sm" />,
    },
    {
      id: "display",
      label: "授课终端显示",
      icon: <NupulIcon name="settings" size="sm" />,
    },
    {
      id: "sync",
      label: "资源同步与缓存",
      icon: <NupulIcon name="cloud" size="sm" />,
    },
  ];

  const aboutItems: MenuItem[] = [
    {
      id: "about",
      label: "关于「青墙粉绘」",
      icon: <NupulIcon name="pattern" size="sm" />,
    },
    {
      id: "help",
      label: "使用帮助",
      icon: <NupulIcon name="messages" size="sm" />,
    },
  ];

  const openNotificationsCenter = () => {
    if (!onOpenNotifications) return;
    setOpen(false);
    setActivePanel(null);
    window.setTimeout(() => onOpenNotifications(), 0);
  };

  const handleItemSelect = (item: MenuItem) => {
    if (item.id === "notify") {
      openNotificationsCenter();
      return;
    }
    if (item.id === "sync" && onClearPendingCache) {
      onClearPendingCache();
    }
    if (item.onClick) {
      item.onClick();
      setOpen(false);
      setActivePanel(null);
      return;
    }
    setActivePanel(item.id);
  };

  const panelCopy: Record<string, { title: string; body: string }> = {
    display: {
      title: "授课终端显示",
      body: "默认开启 3D 全景投屏同步与学生平板镜像。画布导出格式为 PNG，分辨率适配教室大屏。",
    },
    about: {
      title: "关于「青墙粉绘」",
      body: "云南大理双廊中心小学美育课题组 · 数字化非遗进校园试点系统。",
    },
    help: {
      title: "使用帮助",
      body: "从顶栏切换一级模块，二级页签下划线 Tab 切换子功能。点击头像可查看个人信息与系统设置。",
    },
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        id={role === "teacher" ? TEACHER_AVATAR_ANCHOR_ID : undefined}
        type="button"
        onClick={() => {
          setOpen((wasOpen) => {
            const next = !wasOpen;
            if (next) {
              const anchor = rootRef.current;
              if (anchor) {
                const rect = anchor.getBoundingClientRect();
                const width = Math.min(window.innerWidth - 32, 320);
                setMenuStyle({
                  top: rect.bottom + 8,
                  right: Math.max(16, window.innerWidth - rect.right),
                  width,
                });
              }
            } else {
              setMenuStyle(null);
            }
            return next;
          });
          setActivePanel(null);
          if (onClearPendingCache) onClearPendingCache();
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "nupul-avatar-trigger relative rounded-full cursor-pointer transition ring-offset-2 hover:ring-2 hover:ring-nupul-green/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-nupul-green-dark",
          avatarPulse && "avatar-cache-pulse",
        )}
      >
        <UserAvatarCircle
          name={displayName}
          roleLabel={roleLabel}
          loading={loading}
        />
        {role === "teacher" && pendingCacheCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-nupul-green text-white text-[10px] font-black flex items-center justify-center border-2 border-nupul-dark"
            aria-label={`${pendingCacheCount} 个新缓存资源`}
          >
            {pendingCacheCount > 9 ? "9+" : pendingCacheCount}
          </span>
        )}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && menuStyle && (
              <motion.div
                ref={menuRef}
                role="menu"
                onMouseDown={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: menuStyle.top,
                  right: menuStyle.right,
                  width: menuStyle.width,
                  zIndex: 200,
                }}
                className={cn(
                  "bg-white rounded-2xl border-2 border-nupul-dark overflow-hidden shadow-none",
                )}
              >
            {/* 个人信息区 */}
            <div className="mx-2 mt-2 mb-1 rounded-xl bg-nupul-soft-green/30 border border-nupul-green/20 p-3">
              <div className="flex items-center gap-3">
                <UserAvatarCircle name={displayName} loading={loading} />
                <div className="min-w-0 flex-1">
                  <p className="text-secondary font-bold text-nupul-dark truncate">
                    {displayName}
                    {role === "teacher" ? " 老师" : ""}
                  </p>
                  <p className="text-caption font-semibold text-nupul-green-dark mt-0.5">
                    {roleLabel}
                  </p>
                </div>
                <ChevronRight />
              </div>
              {subtitle && (
                <p className="text-caption text-nupul-dark/65 font-semibold mt-2.5 leading-snug pl-[52px]">
                  {subtitle}
                </p>
              )}
              {role === "teacher" && teacher?.workId && (
                <p className="text-caption text-nupul-dark/45 font-mono mt-1 pl-[52px]">
                  工号 {teacher.workId}
                </p>
              )}
            </div>

            <MenuDivider />

            {/* 系统设置 */}
            <div className="py-1.5">
              <p className="px-4 pt-1 pb-1 text-caption font-bold text-nupul-dark/45 uppercase tracking-wider">
                系统设置
              </p>
              {settingsItems
                .filter((item) => item.id !== "notify" || onOpenNotifications)
                .map((item) => (
                  <div key={item.id} className="relative">
                    <MenuRow item={item} onSelect={handleItemSelect} />
                    {item.id === "sync" && pendingCacheCount > 0 && (
                      <span className="absolute right-9 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-nupul-green" />
                    )}
                  </div>
                ))}
            </div>

            <MenuDivider />

            <div className="py-1.5">
              {aboutItems.map((item) => (
                <div key={item.id}>
                  <MenuRow item={item} onSelect={handleItemSelect} />
                </div>
              ))}
            </div>

            {onSwitchRole && (
              <>
                <MenuDivider />
                <div className="py-1.5">
                  <MenuRow
                    item={{
                      id: "switch-role",
                      label:
                        role === "teacher"
                          ? "切换至学生端 · 研学舱"
                          : "切换至教师端 · 备课台",
                      icon: (
                        <NupulIcon
                          name={role === "teacher" ? "user" : "home"}
                          size="sm"
                        />
                      ),
                      onClick: onSwitchRole,
                    }}
                    onSelect={handleItemSelect}
                  />
                </div>
              </>
            )}

            <MenuDivider />

            <div className="py-1.5">
              <MenuRow
                item={{
                  id: "logout",
                  label: "返回主页",
                  danger: true,
                  icon: <NupulIcon name="home" size="sm" />,
                  onClick: onLogout,
                }}
                onSelect={handleItemSelect}
              />
            </div>

            <AnimatePresence>
              {activePanel === "sync" && role === "teacher" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-nupul-dark/10 bg-nupul-cream/60 overflow-hidden"
                >
                  <ResourceSyncPanel
                    items={cachedItems}
                    folderPath={cacheFolderPath}
                    onOpenFolder={() => onOpenLocalCacheFolder?.()}
                  />
                </motion.div>
              )}
              {activePanel && activePanel !== "sync" && panelCopy[activePanel] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-nupul-dark/10 bg-nupul-cream/60 overflow-hidden"
                >
                  <div className="px-4 py-3">
                    <p className="text-caption font-bold text-nupul-dark">
                      {panelCopy[activePanel].title}
                    </p>
                    <p className="text-caption text-nupul-dark/70 font-semibold mt-1.5 leading-relaxed">
                      {panelCopy[activePanel].body}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};
