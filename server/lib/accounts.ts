import {
  DEFAULT_STUDENTS,
  DEFAULT_TEACHERS,
  gradeFromClassCode,
} from '../../src/data/accounts.js';
import type { DataStore } from '../seed.js';

export function ensureAccountRoster(store: DataStore) {
  const teacherKeys = new Set(store.teachers.map((t) => t.workId));
  for (const t of DEFAULT_TEACHERS) {
    if (!teacherKeys.has(t.workId)) {
      store.teachers.push({
        id: t.id,
        workId: t.workId,
        name: t.name,
        password: t.password,
      });
      teacherKeys.add(t.workId);
    } else {
      const existing = store.teachers.find((x) => x.workId === t.workId)!;
      existing.name = t.name;
      existing.password = t.password;
    }
  }

  if (!store.students) store.students = [];
  const studentIds = new Set(store.students.map((s) => s.id));
  for (const s of DEFAULT_STUDENTS) {
    if (!studentIds.has(s.id)) {
      store.students.push({
        id: s.id,
        studentNo: s.studentNo,
        name: s.name,
        classCode: s.classCode,
        grade: s.grade,
        password: s.password,
      });
      studentIds.add(s.id);
    }
  }
}

export function resolveStudentGradeLabel(classCode?: string, grade?: string): string {
  if (grade?.trim()) return grade.trim();
  if (classCode?.trim()) return gradeFromClassCode(classCode.trim());
  return '';
}

export function findStudentInRoster(
  store: DataStore,
  opts: {
    studentId?: string;
    name?: string;
    studentNo?: string;
    classCode?: string;
    grade?: string;
  },
) {
  const gradeLabel = resolveStudentGradeLabel(opts.classCode, opts.grade);
  const name = opts.name?.trim();
  const studentNo = opts.studentNo?.trim();

  if (opts.studentId?.trim()) {
    return store.students?.find((s) => s.id === opts.studentId) ?? null;
  }

  if (studentNo) {
    return store.students?.find((s) => s.studentNo === studentNo) ?? null;
  }

  if (!name || !store.students?.length) return null;

  const matches = store.students.filter((s) => s.name === name);
  if (matches.length === 0) return null;
  if (gradeLabel) {
    const byGrade = matches.filter(
      (s) => s.grade === gradeLabel || s.classCode === opts.classCode,
    );
    return byGrade[0] ?? null;
  }
  return matches.length === 1 ? matches[0] : null;
}
