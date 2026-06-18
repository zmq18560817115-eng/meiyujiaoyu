import React from "react";
import { NavTabBar, NavTabButton } from "../ui/NavTab";
import { NavIconLabel } from "../icons";

export type TeacherMainTab = "home" | "lessons" | "resources" | "works";
export type StudentMainTab = "view3d" | "canvas" | "gallery";

interface TeacherMainNavProps {
  activeTab: TeacherMainTab;
  onChange: (tab: TeacherMainTab) => void;
  pendingWorks?: number;
}

export const TeacherMainNav: React.FC<TeacherMainNavProps> = ({
  activeTab,
  onChange,
  pendingWorks = 0,
}) => (
  <NavTabBar prominent fullWidth className="w-full">
    <NavTabButton
      active={activeTab === "home"}
      onClick={() => onChange("home")}
      size="md"
      stretch
    >
      <NavIconLabel icon="home">首页</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "lessons"}
      onClick={() => onChange("lessons")}
      size="md"
      stretch
    >
      <NavIconLabel icon="course">AI备课</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "resources"}
      onClick={() => onChange("resources")}
      size="md"
      stretch
    >
      <NavIconLabel icon="pattern">照壁故事素材</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "works"}
      onClick={() => onChange("works")}
      size="md"
      stretch
    >
      <NavIconLabel icon="favorites">作品批改 ({pendingWorks})</NavIconLabel>
    </NavTabButton>
  </NavTabBar>
);

interface StudentMainNavProps {
  activeTab: StudentMainTab;
  onChange: (tab: StudentMainTab) => void;
}

export const StudentMainNav: React.FC<StudentMainNavProps> = ({
  activeTab,
  onChange,
}) => (
  <NavTabBar prominent fullWidth className="w-full">
    <NavTabButton
      active={activeTab === "view3d"}
      onClick={() => onChange("view3d")}
      size="md"
      stretch
    >
      <NavIconLabel icon="cube">3D鉴赏</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "canvas"}
      onClick={() => onChange("canvas")}
      size="md"
      stretch
    >
      <NavIconLabel icon="brush">智慧绘画</NavIconLabel>
    </NavTabButton>
    <NavTabButton
      active={activeTab === "gallery"}
      onClick={() => onChange("gallery")}
      size="md"
      stretch
    >
      <NavIconLabel icon="palette">作品展示</NavIconLabel>
    </NavTabButton>
  </NavTabBar>
);
