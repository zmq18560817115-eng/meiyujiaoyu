import type {
  Course,
  Resource,
  StudentArtwork,
  StudentProgressStats,
} from "../types";

const TEACHER_TOKEN_KEY = "qingqiang_teacher_token";
const STUDENT_TOKEN_KEY = "qingqiang_student_token";
const VISITOR_KEY = "qingqiang_visitor_id";

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type AuthRole = "teacher" | "student";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getAuthToken(role?: AuthRole): string | null {
  if (role === "teacher") return localStorage.getItem(TEACHER_TOKEN_KEY);
  if (role === "student") return localStorage.getItem(STUDENT_TOKEN_KEY);
  return (
    localStorage.getItem(TEACHER_TOKEN_KEY) ||
    localStorage.getItem(STUDENT_TOKEN_KEY)
  );
}

export function setAuthToken(token: string | null, role: AuthRole = "teacher") {
  const key = role === "student" ? STUDENT_TOKEN_KEY : TEACHER_TOKEN_KEY;
  if (token) localStorage.setItem(key, token);
  else localStorage.removeItem(key);
}

export function clearAllTokens() {
  localStorage.removeItem(TEACHER_TOKEN_KEY);
  localStorage.removeItem(STUDENT_TOKEN_KEY);
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean; role?: AuthRole } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Visitor-Id": getVisitorId(),
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken(options.role);
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || `请求失败 (${res.status})`);
  }

  return json.data;
}

export const api = {
  auth: {
    teacherLogin: (workId: string, password?: string) =>
      apiFetch<{
        token: string;
        role: string;
        teacher: { id: string; workId: string; name: string };
      }>("/api/auth/teacher/login", {
        method: "POST",
        body: JSON.stringify({ workId, password }),
        auth: false,
      }),
    studentLogin: (payload: {
      name?: string;
      classCode?: string;
      grade?: string;
      studentId?: string;
      studentNo?: string;
      password?: string;
    }) =>
      apiFetch<{
        token: string;
        role: string;
        student: { id: string; name: string; grade: string; studentNo?: string };
      }>("/api/auth/student/login", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false,
      }),
    roster: () =>
      apiFetch<{
        teachers: Array<{
          workId: string;
          name: string;
          school?: string;
          title?: string;
        }>;
        students: Array<{
          id: string;
          studentNo: string;
          name: string;
          classCode: string;
          grade: string;
        }>;
      }>("/api/auth/roster", { auth: false }),
    me: (role?: AuthRole) =>
      apiFetch<{ role: string; teacher?: unknown; student?: unknown }>(
        "/api/auth/me",
        { role },
      ),
    logout: () =>
      apiFetch<{ loggedOut: boolean }>("/api/auth/logout", {
        method: "POST",
        auth: false,
      }),
  },

  bootstrap: {
    student: () =>
      apiFetch<{
        artworks: StudentArtwork[];
        hotspots: Array<{
          id: string;
          x: string;
          y: string;
          title: string;
          bilingual: string;
          desc: string;
        }>;
        projection: { hotspotId: string; active?: boolean; updatedAt: number };
        prideIndex: number;
      }>("/api/bootstrap/student", { auth: false }),
    teacher: () =>
      apiFetch<{
        courses: Course[];
        resources: Resource[];
        artworks: StudentArtwork[];
        announcements: Array<{
          id: string;
          title: string;
          date: string;
          src: string;
        }>;
        schedules: Array<{
          id: string;
          time: string;
          className: string;
          title: string;
          note: string;
          status: string;
        }>;
        stats: StudentProgressStats & { prideScore?: number };
        projection: { hotspotId: string; active?: boolean; updatedAt: number };
      }>("/api/bootstrap/teacher"),
  },

  courses: {
    list: (category?: string) =>
      apiFetch<{ courses: Course[] }>(
        `/api/courses${category ? `?category=${category}` : ""}`,
        { auth: false },
      ),
    create: (course: Partial<Course> & { title: string }) =>
      apiFetch<{ course: Course }>("/api/courses", {
        method: "POST",
        body: JSON.stringify(course),
        role: "teacher",
      }),
  },

  resources: {
    list: (type?: string) =>
      apiFetch<{ resources: Resource[] }>(
        `/api/resources${type ? `?type=${type}` : ""}`,
        { auth: false },
      ),
    create: (payload: {
      title: string;
      type?: string;
      fileType?: string;
      size?: string;
      previewUrl?: string;
    }) =>
      apiFetch<{ resource: Resource }>("/api/resources", {
        method: "POST",
        body: JSON.stringify(payload),
        role: "teacher",
      }),
    download: (id: string) =>
      apiFetch<{ resource: Resource; downloadUrl: string | null }>(
        `/api/resources/${id}/download`,
        { method: "POST", auth: false },
      ),
  },

  artworks: {
    list: (params?: { approved?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.approved === true) q.set("approved", "true");
      if (params?.approved === false) q.set("approved", "false");
      return apiFetch<{ artworks: StudentArtwork[]; total: number }>(
        `/api/artworks?${q.toString()}`,
        { auth: false },
      );
    },
    create: (payload: {
      studentName?: string;
      title?: string;
      grade?: string;
      diary?: string;
      tags?: string[];
      imageUrl?: string;
      templateType?: string;
      artworkData?: unknown;
      approved?: boolean;
    }) =>
      apiFetch<{ artwork: StudentArtwork }>("/api/artworks", {
        method: "POST",
        body: JSON.stringify(payload),
        role: "student",
      }),
    approve: (id: string, badge: string) =>
      apiFetch<{ artwork: StudentArtwork }>(`/api/artworks/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ badge, approved: true }),
        role: "teacher",
      }),
    unpublish: (id: string) =>
      apiFetch<{ artwork: StudentArtwork }>(`/api/artworks/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approved: false }),
        role: "teacher",
      }),
    like: (id: string) =>
      apiFetch<{ likes: number; hasLiked: boolean }>(
        `/api/artworks/${id}/likes`,
        {
          method: "POST",
          auth: false,
          body: JSON.stringify({ visitorId: getVisitorId() }),
        },
      ),
  },

  dashboard: {
    teacher: () =>
      apiFetch<{
        activeStudents: number;
        completionRate: number;
        totalWorks: number;
        pendingReviews: number;
        prideScore: number;
        masteryScores: StudentProgressStats["masteryScores"];
        rankList: StudentProgressStats["rankList"];
        galleryCount: number;
      }>("/api/dashboard/teacher", { role: "teacher" }),
    prideIndex: () =>
      apiFetch<{ prideIndex: number; level: string }>(
        "/api/stats/pride-index",
        { auth: false },
      ),
  },

  announcements: {
    list: () =>
      apiFetch<{
        announcements: Array<{
          id: string;
          title: string;
          date: string;
          src: string;
        }>;
      }>("/api/announcements", { auth: false }),
  },

  panorama: {
    hotspots: (sceneId = "xiyuan") =>
      apiFetch<{
        hotspots: Array<{
          id: string;
          x: string;
          y: string;
          title: string;
          bilingual: string;
          desc: string;
        }>;
      }>(`/api/panorama/hotspots?sceneId=${sceneId}`, { auth: false }),
    setProjection: (hotspotId: string, active = true) =>
      apiFetch<{
        projection: { hotspotId: string; active?: boolean; updatedAt: number };
      }>("/api/panorama/projection", {
        method: "POST",
        body: JSON.stringify({ hotspotId, active }),
        role: "teacher",
      }),
    labStatus: () =>
      apiFetch<{
        terminals: Array<{
          seat: number;
          label: string;
          connected: boolean;
          studentName?: string;
        }>;
        summary: {
          total: number;
          connected: number;
          offline: Array<{
            seat: number;
            label: string;
            connected: boolean;
            studentName?: string;
          }>;
        };
      }>("/api/panorama/lab-status", { role: "teacher" }),
    labRefresh: () =>
      apiFetch<{
        terminals: Array<{
          seat: number;
          label: string;
          connected: boolean;
          studentName?: string;
        }>;
        summary: {
          total: number;
          connected: number;
          offline: Array<{
            seat: number;
            label: string;
            connected: boolean;
            studentName?: string;
          }>;
        };
      }>("/api/panorama/lab-refresh", {
        method: "POST",
        role: "teacher",
      }),
  },

  whiteboard: {
    structure: (topic: string) =>
      apiFetch<{ cards: string[]; title: string }>(
        "/api/whiteboards/structure",
        {
          method: "POST",
          body: JSON.stringify({ topic }),
          role: "teacher",
        },
      ),
  },

  uploads: {
    base64: (base64: string, filename?: string) =>
      apiFetch<{ fileId: string; url: string }>("/api/uploads", {
        method: "POST",
        body: JSON.stringify({ base64, filename }),
        auth: false,
      }),
  },

  pptKnowledge: {
    list: () =>
      apiFetch<{
        version: number;
        entries: Array<{
          id: string;
          title?: string;
          keywords: string[];
          theoryContent?: string;
          images: Array<{ path: string; caption: string; assetId?: string }>;
        }>;
      }>("/api/ppt-knowledge"),
    create: (payload: {
      title: string;
      keywords: string[];
      theoryContent?: string;
    }) =>
      apiFetch<{ entry: unknown }>("/api/ppt-knowledge/entries", {
        method: "POST",
        body: JSON.stringify(payload),
        role: "teacher",
      }),
  },

  ai: {
    chat: (
      message: string,
      history: Array<{ sender: string; text: string }>,
      role?: "teacher" | "student",
      lessonTopic?: string,
    ) => {
      return fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, role, lessonTopic }),
      }).then(async (res) => {
        const json = await res.json();
        if (json.data) return json.data as { text: string; source?: string };
        return json as { text: string; source?: string };
      });
    },
    prepare: (topic: string) =>
      fetch("/api/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      }).then(async (res) => {
        const json = await res.json();
        return (json.data ?? json) as {
          title: string;
          subtitle: string;
          parts: { name: string; desc: string; tip: string }[];
          suggestions: string[];
        };
      }),
    motif: (idea: string) =>
      fetch("/api/ai-motif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      }).then(async (res) => {
        const json = await res.json();
        return (json.data ?? json) as {
          colors: string[];
          colorExplanation: string;
          culturalMeaning: string;
        };
      }),
  },
};
