/** 演示账号名册（前后端共用，勿写入真实生产密码） */

export type TeacherAccount = {
  id: string;
  workId: string;
  name: string;
  password: string;
  school: string;
  title: string;
};

export type StudentAccount = {
  id: string;
  studentNo: string;
  name: string;
  classCode: string;
  grade: string;
  password: string;
};

export const CLASS_OPTIONS = [
  { code: "g3-2", label: "三年级 2班" },
  { code: "g4-1", label: "四年级 1班" },
  { code: "g4-2", label: "四年级 2班" },
  { code: "g5-1", label: "五年级 1班" },
] as const;

export function gradeFromClassCode(classCode: string): string {
  return CLASS_OPTIONS.find((c) => c.code === classCode)?.label ?? classCode;
}

/** 4 位教师（双廊镇中心小学） */
export const DEFAULT_TEACHERS: TeacherAccount[] = [
  {
    id: "t1",
    workId: "SL-1008",
    name: "徐海明",
    password: "demo123",
    school: "双廊镇中心小学",
    title: "美育学科带头人",
  },
  {
    id: "t2",
    workId: "SL-2001",
    name: "李秀芳",
    password: "demo123",
    school: "双廊镇中心小学",
    title: "四年级语文兼美育教师",
  },
  {
    id: "t3",
    workId: "SL-2002",
    name: "张德明",
    password: "demo123",
    school: "双廊镇中心小学",
    title: "三年级班主任",
  },
  {
    id: "t4",
    workId: "SL-2003",
    name: "赵玉兰",
    password: "demo123",
    school: "双廊镇中心小学",
    title: "五年级综合实践教师",
  },
];

/** 10 名学生 */
export const DEFAULT_STUDENTS: StudentAccount[] = [
  {
    id: "stu-01",
    studentNo: "STU-2026-001",
    name: "杨一诺",
    classCode: "g4-1",
    grade: "四年级 1班",
    password: "stu123",
  },
  {
    id: "stu-02",
    studentNo: "STU-2026-002",
    name: "季雨桐",
    classCode: "g3-2",
    grade: "三年级 2班",
    password: "stu123",
  },
  {
    id: "stu-03",
    studentNo: "STU-2026-003",
    name: "李明",
    classCode: "g4-2",
    grade: "四年级 2班",
    password: "stu123",
  },
  {
    id: "stu-04",
    studentNo: "STU-2026-004",
    name: "张宇涵",
    classCode: "g5-1",
    grade: "五年级 1班",
    password: "stu123",
  },
  {
    id: "stu-05",
    studentNo: "STU-2026-005",
    name: "段家豪",
    classCode: "g4-1",
    grade: "四年级 1班",
    password: "stu123",
  },
  {
    id: "stu-06",
    studentNo: "STU-2026-006",
    name: "王思琪",
    classCode: "g4-1",
    grade: "四年级 1班",
    password: "stu123",
  },
  {
    id: "stu-07",
    studentNo: "STU-2026-007",
    name: "陈浩然",
    classCode: "g3-2",
    grade: "三年级 2班",
    password: "stu123",
  },
  {
    id: "stu-08",
    studentNo: "STU-2026-008",
    name: "刘梓萱",
    classCode: "g4-2",
    grade: "四年级 2班",
    password: "stu123",
  },
  {
    id: "stu-09",
    studentNo: "STU-2026-009",
    name: "周子轩",
    classCode: "g5-1",
    grade: "五年级 1班",
    password: "stu123",
  },
  {
    id: "stu-10",
    studentNo: "STU-2026-010",
    name: "何雨彤",
    classCode: "g5-1",
    grade: "五年级 1班",
    password: "stu123",
  },
];
