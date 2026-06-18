import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Resource } from "../types";
import { DownloadFlyOverlay } from "../components/shared/DownloadFlyOverlay";

export const TEACHER_AVATAR_ANCHOR_ID = "teacher-avatar-anchor";

export type CachedResource = {
  id: string;
  title: string;
  fileType: string;
  size: string;
  savedAt: string;
};

type FlyPoint = { x: number; y: number };

type ResourceCacheContextValue = {
  cachedItems: CachedResource[];
  pendingCacheCount: number;
  avatarPulse: boolean;
  downloadToLocal: (resource: Resource, sourceEl: HTMLElement) => void;
  exportWeeklyReportToLocal: (
    stats: { pending: number; total: number },
    sourceEl: HTMLElement,
  ) => void;
  clearPendingCache: () => void;
  openLocalCacheFolder: () => Promise<void>;
  folderPath: string;
};

const STORAGE_KEY = "nupul-resource-cache";
const DEFAULT_FOLDER = "~/Downloads/青墙粉绘-资源缓存";

function loadCachedItems(): CachedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CachedResource[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCachedItems(items: CachedResource[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function triggerBrowserDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildResourceBlob(resource: Resource) {
  const content = [
    "青墙粉绘 · 非遗资源缓存",
    `资源名称：${resource.title}`,
    `文件类型：${resource.fileType}`,
    `文件大小：${resource.size}`,
    `缓存时间：${new Date().toLocaleString("zh-CN")}`,
  ].join("\n");
  return new Blob([content], { type: "text/plain;charset=utf-8" });
}

function buildWeeklyReportBlob(stats: { pending: number; total: number }) {
  const now = new Date();
  const content = [
    "青墙粉绘 · 班级美育周报",
    `生成时间：${now.toLocaleString("zh-CN")}`,
    `总作品数：${stats.total} 份`,
    `待审批：${stats.pending} 份`,
    `已归档：${Math.max(stats.total - stats.pending, 0)} 份`,
    "",
    "—— 云南大理双廊中心小学美育课题组 ——",
  ].join("\n");
  return new Blob([content], { type: "text/plain;charset=utf-8" });
}

function formatBlobSize(blob: Blob) {
  if (blob.size < 1024) return `${blob.size} B`;
  return `${(blob.size / 1024).toFixed(1)} KB`;
}

const ResourceCacheContext = createContext<ResourceCacheContextValue | null>(
  null,
);

export function ResourceCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cachedItems, setCachedItems] = useState<CachedResource[]>(loadCachedItems);
  const [pendingCacheCount, setPendingCacheCount] = useState(0);
  const [avatarPulse, setAvatarPulse] = useState(false);
  const [fly, setFly] = useState<{ from: FlyPoint; to: FlyPoint } | null>(null);
  const [folderPath, setFolderPath] = useState(DEFAULT_FOLDER);

  const cacheAndDownload = useCallback(
    (entry: CachedResource, sourceEl: HTMLElement, blob: Blob) => {
      const fromRect = sourceEl.getBoundingClientRect();
      const from: FlyPoint = {
        x: fromRect.left + fromRect.width / 2,
        y: fromRect.top + fromRect.height / 2,
      };

      const avatar = document.getElementById(TEACHER_AVATAR_ANCHOR_ID);
      const toRect = avatar?.getBoundingClientRect();
      if (toRect) {
        setFly({
          from,
          to: {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2,
          },
        });
      }

      setCachedItems((prev) => {
        const next = [entry, ...prev.filter((item) => item.id !== entry.id)];
        persistCachedItems(next);
        return next;
      });
      setPendingCacheCount((c) => c + 1);
      triggerBrowserDownload(`${entry.title}.${entry.fileType}`, blob);
    },
    [],
  );

  const downloadToLocal = useCallback(
    (resource: Resource, sourceEl: HTMLElement) => {
      const blob = buildResourceBlob(resource);
      cacheAndDownload(
        {
          id: resource.id,
          title: resource.title,
          fileType: resource.fileType,
          size: resource.size,
          savedAt: new Date().toISOString(),
        },
        sourceEl,
        blob,
      );
    },
    [cacheAndDownload],
  );

  const exportWeeklyReportToLocal = useCallback(
    (stats: { pending: number; total: number }, sourceEl: HTMLElement) => {
      const now = new Date();
      const dateLabel = now.toLocaleDateString("zh-CN");
      const blob = buildWeeklyReportBlob(stats);
      cacheAndDownload(
        {
          id: `weekly-report-${now.toISOString().slice(0, 10)}`,
          title: `班级美育周报-${dateLabel}`,
          fileType: "pdf",
          size: formatBlobSize(blob),
          savedAt: now.toISOString(),
        },
        sourceEl,
        blob,
      );
    },
    [cacheAndDownload],
  );

  const clearPendingCache = useCallback(() => {
    setPendingCacheCount(0);
    setAvatarPulse(false);
  }, []);

  const openLocalCacheFolder = useCallback(async () => {
    const picker = (
      window as Window & {
        showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker;

    if (picker) {
      try {
        const handle = await picker();
        setFolderPath(handle.name);
        return;
      } catch {
        /* 用户取消选择 */
      }
    }

    setFolderPath(DEFAULT_FOLDER);
  }, []);

  const handleFlyComplete = useCallback(() => {
    setFly(null);
    setAvatarPulse(true);
    window.setTimeout(() => setAvatarPulse(false), 1200);
  }, []);

  const value = useMemo(
    () => ({
      cachedItems,
      pendingCacheCount,
      avatarPulse,
      downloadToLocal,
      exportWeeklyReportToLocal,
      clearPendingCache,
      openLocalCacheFolder,
      folderPath,
    }),
    [
      cachedItems,
      pendingCacheCount,
      avatarPulse,
      downloadToLocal,
      exportWeeklyReportToLocal,
      clearPendingCache,
      openLocalCacheFolder,
      folderPath,
    ],
  );

  return (
    <ResourceCacheContext.Provider value={value}>
      {children}
      <DownloadFlyOverlay fly={fly} onComplete={handleFlyComplete} />
    </ResourceCacheContext.Provider>
  );
}

export function useResourceCache() {
  const ctx = useContext(ResourceCacheContext);
  if (!ctx) {
    throw new Error("useResourceCache must be used within ResourceCacheProvider");
  }
  return ctx;
}
