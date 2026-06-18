/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core types for the Dali Bai Folk House Painting Aesthetic Education System

export type Role = "welcome" | "login" | "teacher" | "student";

export interface Course {
  id: string;
  title: string;
  category: "base" | "motif" | "color" | "craft";
  desc: string;
  duration: string;
  difficulty: "入门" | "进阶" | "大师";
  isLocal?: boolean;
  outline: string[];
  materials?: string[];
  bannerUrl?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "platform" | "core" | "local";
  size: string;
  date: string;
  fileType: string;
  downloads: number;
  previewUrl?: string;
}

export interface StudentArtwork {
  id: string;
  title: string;
  studentName: string;
  studentId?: string;
  grade: string;
  imageUrl: string;
  likes: number;
  hasLiked?: boolean;
  diary: string;
  tags: string[];
  badge?: string;
  approved: boolean;
  date: string;
  templateType?: string;
  artworkData?: unknown;
}

export interface PanoramaHotspot {
  id: string;
  x: string;
  y: string;
  title: string;
  bilingual: string;
  desc: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  src: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  className: string;
  title: string;
  note: string;
  status: "active" | "pending";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  audioUrl?: string; // Optional simulated Bai/Mandarin audio
}

export interface StudentProgressStats {
  completionRate: number;
  activeStudents: number;
  totalWorks: number;
  masteryScores: {
    motif: number; // 纹样认知
    color: number; // 色彩拼贴
    history: number; // 历史背景
  };
  rankList: { name: string; worksCount: number; score: number }[];
}
