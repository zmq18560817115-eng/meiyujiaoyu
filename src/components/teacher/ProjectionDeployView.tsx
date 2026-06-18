import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { PageBreadcrumb, StatChip } from "../shared/SubPageNav";
import { BackButtonLabel } from "../icons";
import { renderDiffuseAccents } from "../ui/DiffuseDecor";
import {
  LAB_SEAT_COUNT,
  machineCode,
  type LabTerminal,
} from "../../types/lab";

const DEMO_OFFLINE_SEATS = new Set([7, 15, 26]);

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

function buildDemoTerminals(): LabTerminal[] {
  return Array.from({ length: LAB_SEAT_COUNT }, (_, i) => {
    const seat = i + 1;
    return {
      seat,
      label: machineCode(seat),
      connected: !DEMO_OFFLINE_SEATS.has(seat),
    };
  });
}

function ensureTerminals(terminals: LabTerminal[]): LabTerminal[] {
  if (terminals.length === LAB_SEAT_COUNT) return terminals;
  if (terminals.length === 0) return buildDemoTerminals();

  const bySeat = new Map(terminals.map((t) => [t.seat, t]));
  return Array.from({ length: LAB_SEAT_COUNT }, (_, i) => {
    const seat = i + 1;
    return (
      bySeat.get(seat) ?? {
        seat,
        label: machineCode(seat),
        connected: false,
      }
    );
  });
}

function MonitorTile({
  terminal,
  refreshing,
}: {
  terminal: LabTerminal;
  refreshing: boolean;
}) {
  const connected = terminal.connected;
  const code = machineCode(terminal.seat);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "relative w-full aspect-[4/3] rounded-lg border-2 border-nupul-dark p-1.5 transition",
          refreshing && "opacity-70 animate-pulse",
          connected
            ? "border-nupul-green-dark bg-nupul-soft-green/30"
            : "border-red-400/80 bg-red-50/60",
        )}
        title={connected ? `${code} · 已连接` : `${code} · 未连接`}
      >
        <div
          className={cn(
            "h-full w-full rounded-md border-2 flex flex-col items-center justify-center gap-1",
            connected
              ? "border-nupul-green-dark/25 bg-white"
              : "border-red-300/40 bg-red-50",
          )}
        >
          <span
            className={cn(
              "text-sm font-black leading-none",
              connected ? "text-nupul-green-dark" : "text-red-500/70",
            )}
          >
            {code}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              connected
                ? "bg-nupul-green/50 text-nupul-dark"
                : "bg-red-100 text-red-600",
            )}
          >
            {connected ? "已连接" : "未连接"}
          </span>
        </div>
        {connected && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nupul-green-dark animate-pulse" />
        )}
      </div>
      <p
        className={cn(
          "text-[10px] font-bold truncate w-full text-center",
          connected ? "text-nupul-dark/80" : "text-red-500/80",
        )}
      >
        {refreshing ? "扫描中…" : connected ? code : "等待连接"}
      </p>
    </div>
  );
}

interface ProjectionDeployViewProps {
  active: boolean;
  hotspotId: string;
  terminals: LabTerminal[];
  refreshing: boolean;
  onToggleProjection: () => void;
  onBack: () => void;
  onRefresh: () => Promise<{
    terminals: LabTerminal[];
    summary: { total: number; connected: number; offline: LabTerminal[] };
  } | null>;
}

export const ProjectionDeployView: React.FC<ProjectionDeployViewProps> = ({
  active,
  hotspotId,
  terminals,
  refreshing,
  onToggleProjection,
  onBack,
  onRefresh,
}) => {
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const [localTerminals, setLocalTerminals] = useState<LabTerminal[]>([]);

  useEffect(() => {
    setLocalTerminals(ensureTerminals(terminals));
  }, [terminals]);

  const visibleTerminals = useMemo(() => {
    const base = ensureTerminals(
      localTerminals.length ? localTerminals : terminals,
    );
    if (!active) {
      return base.map((t) => ({ ...t, connected: false }));
    }
    return base;
  }, [active, localTerminals, terminals]);

  const connectedCount = visibleTerminals.filter((t) => t.connected).length;
  const offlineSeats = visibleTerminals.filter((t) => !t.connected);

  const runRefresh = useCallback(async () => {
    if (!active) {
      setRefreshNote("请先开启全班投屏，再刷新连接");
      return;
    }

    setRefreshNote("正在重新扫描机房终端，请稍候…");
    const result = await onRefresh();

    if (!result?.terminals) {
      setRefreshNote("刷新失败，请确认教师已登录后重试");
      return;
    }

    setLocalTerminals(ensureTerminals(result.terminals));
    const connected = result.terminals.filter((t) => t.connected).length;

    if (connected === LAB_SEAT_COUNT) {
      setRefreshNote(`刷新完成：全部 ${LAB_SEAT_COUNT} 台终端已重新连接`);
    } else {
      setRefreshNote(
        `刷新完成：已连接 ${connected} / ${LAB_SEAT_COUNT} 台，请再次点击刷新连接`,
      );
    }
  }, [active, onRefresh]);

  useEffect(() => {
    if (!refreshNote) return;
    const timer = window.setTimeout(() => setRefreshNote(null), 5000);
    return () => window.clearTimeout(timer);
  }, [refreshNote]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl border-3 border-nupul-dark bg-white p-5 sm:p-6 space-y-5 min-h-[calc(100vh-220px)] overflow-hidden"
    >
      {renderDiffuseAccents([
        { corner: "tr", color: "green", inset: true, soft: true, size: "sm" },
        { corner: "bl", color: "yellow", inset: true, soft: true, size: "sm" },
      ])}
      <div className="relative z-10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-nupul-dark/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="bg-white hover:bg-nupul-cream text-nupul-dark px-3 py-1.5 rounded-xl border-2 border-nupul-dark transition cursor-pointer text-caption font-bold"
          >
            <BackButtonLabel label="返回课堂" />
          </button>
          <PageBreadcrumb segments={["3D课堂", "无线投屏到学生"]} />
        </div>
        <button
          type="button"
          onClick={runRefresh}
          disabled={refreshing || !active}
          className={cn(
            "shrink-0 px-4 py-1.5 rounded-xl border-2 border-nupul-dark text-caption font-bold cursor-pointer transition",
            refreshing || !active
              ? "bg-nupul-cream/60 text-nupul-dark/45 cursor-not-allowed"
              : "bg-nupul-cream hover:bg-nupul-green/30 text-nupul-dark",
          )}
        >
          {refreshing ? "正在刷新…" : "刷新连接"}
        </button>
      </div>

      {refreshNote && (
        <div className="rounded-2xl border-2 border-nupul-green-dark/25 bg-nupul-soft-green/30 px-4 py-3 text-caption font-semibold text-nupul-dark/80">
          {refreshNote}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-4">
          <StatChip label="投屏状态" value={active ? "已开启" : "未开启"} />
          <p className="text-caption text-nupul-dark/65 font-semibold leading-relaxed">
            当前同步视角：
            <span className="text-nupul-green-dark font-bold ml-1">
              {hotspotId}
            </span>
          </p>
          <button
            type="button"
            onClick={onToggleProjection}
            className="w-full nupul-pill-btn-green py-3.5 text-caption font-black cursor-pointer"
          >
            {active ? "关闭全班投屏" : "开启全班投屏"}
          </button>
          <div className="rounded-2xl border-2 border-nupul-dark/10 bg-nupul-cream px-4 py-3 space-y-1">
            <p className="text-caption font-bold text-nupul-dark/70">
              机房连接概览
            </p>
            <p className="text-display-sm font-black text-nupul-green-dark">
              {connectedCount}
              <span className="text-secondary font-bold text-nupul-dark/50">
                {" "}
                / {LAB_SEAT_COUNT}
              </span>
            </p>
            <p className="text-caption text-nupul-dark/60 font-semibold">
              {!active
                ? "全班未连接，请开启投屏后刷新"
                : offlineSeats.length > 0
                  ? `${offlineSeats.length} 台终端未连接`
                  : "全部终端已就绪"}
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h5 className="text-secondary font-bold text-nupul-dark">
              微机室终端部署状态（30 座）
            </h5>
            <div className="flex items-center gap-3 text-caption font-bold">
              <span className="flex items-center gap-1.5 text-nupul-green-dark">
                <span className="w-3 h-3 rounded-sm border-2 border-nupul-green-dark bg-nupul-soft-green/40" />
                已连接
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-3 h-3 rounded-sm border-2 border-red-400 bg-red-50" />
                未连接
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-3xl border-3 border-nupul-dark/15 bg-nupul-cream/40 p-4 sm:p-5">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {visibleTerminals.map((terminal) => (
                <MonitorTile
                  key={terminal.seat}
                  terminal={terminal}
                  refreshing={refreshing}
                />
              ))}
            </div>
          </div>

          {active && offlineSeats.length > 0 && (
            <div className="mt-4 bg-red-50/90 border-2 border-red-300/60 rounded-2xl p-4">
              <p className="text-caption font-bold text-red-700 mb-1.5">
                以下终端未连接，可点击「刷新连接」重新上线：
              </p>
              <p className="text-caption text-red-600/90 font-semibold leading-relaxed">
                {offlineSeats.map((t) => t.label).join("、")}
              </p>
            </div>
          )}
        </section>
      </div>
      </div>
    </motion.div>
  );
};
