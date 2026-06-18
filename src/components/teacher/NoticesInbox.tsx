import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import type { Announcement } from "../../types";
import { PageBreadcrumb } from "../shared/SubPageNav";
import { StatusTag } from "../ui/Tag";

const NOTICE_BODIES: Record<string, string> = {
  a1: "请于本周五前完成班级学生彩绘作品线上提交与初审。入选作品将同步至「数智画廊」校级展厅，并参与市级非遗美育展评。",
  a2: "由徐老师主笔的《白族民居门楣彩绘入门》教案获评省级一等奖。教研组将于下周三下午组织校内分享会，欢迎各年级美育教师参加。",
  a3: "新增「蝴蝶纹设色」「照壁光影」微课素材包，并优化 3D 热点讲解脚本。建议在备课台「非遗资源库」中一键同步至本班授课终端。",
};

interface NoticesInboxProps {
  open: boolean;
  announcements: Announcement[];
  readIds: Set<string>;
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NoticesInbox: React.FC<NoticesInboxProps> = ({
  open,
  announcements,
  readIds,
  selectedId,
  onClose,
  onSelect,
  onMarkRead,
  onMarkAllRead,
}) => {
  const activeId =
    selectedId ??
    announcements.find((a) => !readIds.has(a.id))?.id ??
    announcements[0]?.id;
  const active = announcements.find((a) => a.id === activeId);
  const ignoreBackdropClose = useRef(false);

  useEffect(() => {
    if (!open) return;
    ignoreBackdropClose.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClose.current = false;
    }, 320);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleBackdropClose = () => {
    if (ignoreBackdropClose.current) return;
    onClose();
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nupul-dark/30 z-[200]"
            onMouseDown={handleBackdropClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg z-[210] bg-nupul-cream border-l-4 border-nupul-dark flex flex-col"
          >
            <div className="p-5 border-b-3 border-nupul-dark/15 bg-white">
              <PageBreadcrumb segments={["工作台", "通知接收中心"]} />
              <div className="flex items-start justify-between gap-3 mt-2">
                <div>
                  <h3 className="text-display-sm font-medium text-nupul-dark">
                    校园通知接收中心
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark text-caption font-bold cursor-pointer"
                >
                  关闭
                </button>
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="mt-3 text-caption font-bold text-nupul-green-dark bg-nupul-green/20 border-2 border-nupul-green-dark/25 px-3 py-1 rounded-full cursor-pointer hover:bg-nupul-green/35"
              >
                全部标为已读
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto border-b-2 border-nupul-dark/10 max-h-[42%] shrink-0">
                {announcements.map((ann) => {
                  const unread = !readIds.has(ann.id);
                  const selected = ann.id === activeId;
                  return (
                    <button
                      key={ann.id}
                      type="button"
                      onClick={() => {
                        onSelect(ann.id);
                        onMarkRead(ann.id);
                      }}
                      className={`w-full text-left px-5 py-3 border-b border-dashed border-nupul-dark/10 transition cursor-pointer ${
                        selected
                          ? "bg-nupul-yellow/35"
                          : "bg-transparent hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-caption font-mono font-bold text-nupul-orange block">
                            {ann.date} · {ann.src}
                          </span>
                          <p className="text-caption font-bold text-nupul-dark mt-0.5 leading-snug line-clamp-2">
                            {ann.title}
                          </p>
                        </div>
                        {unread && (
                          <StatusTag variant="danger" className="shrink-0">
                            未读
                          </StatusTag>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {active ? (
                  <article className="bg-white rounded-2xl border-3 border-nupul-dark p-5 space-y-4">
                    <div>
                      <span className="text-caption font-mono font-bold text-nupul-orange">
                        {active.date}
                      </span>
                      <span className="text-caption text-nupul-dark/50 mx-2">
                        ·
                      </span>
                      <span className="text-caption font-bold text-nupul-green-dark">
                        {active.src}
                      </span>
                    </div>
                    <h4 className="text-body font-bold text-nupul-dark leading-snug">
                      {active.title}
                    </h4>
                    <p className="text-caption text-nupul-dark/85 leading-relaxed font-semibold">
                      {NOTICE_BODIES[active.id] ??
                        "本条通知暂无扩展正文，请留意教务后续补充说明或线下传达。"}
                    </p>
                    <div className="bg-nupul-cream border-2 border-dashed border-nupul-dark/20 rounded-xl p-3 text-caption text-nupul-dark/70">
                      接收状态：{readIds.has(active.id) ? "已读" : "未读"} ·
                      系统已同步至教师工作台
                    </div>
                  </article>
                ) : (
                  <p className="text-caption text-center text-nupul-dark/50 py-12">
                    暂无通知
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
};
