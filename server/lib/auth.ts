import type { Request, Response, NextFunction } from 'express';
import { loadStore } from './store.js';
import { fail } from './response.js';

export type AuthedRequest = Request & {
  teacher?: { id: string; name: string; workId: string };
  student?: { id: string; name: string; grade: string };
  sessionToken?: string;
  sessionRole?: 'teacher' | 'student';
};

export function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function resolveTeacher(token: string | null) {
  if (!token) return null;
  const store = loadStore();
  const session = store.sessions[token];
  if (!session) return null;
  const teacher = store.teachers.find((t) => t.id === session.teacherId);
  if (!teacher) return null;
  return { id: teacher.id, name: teacher.name, workId: teacher.workId };
}

export function resolveStudent(token: string | null) {
  if (!token) return null;
  const store = loadStore();
  const session = store.studentSessions?.[token];
  if (!session) return null;
  return { id: session.studentId, name: session.name, grade: session.grade };
}

export function resolveSession(token: string | null) {
  const teacher = resolveTeacher(token);
  if (teacher) return { role: 'teacher' as const, teacher };
  const student = resolveStudent(token);
  if (student) return { role: 'student' as const, student };
  return null;
}

export function requireTeacher(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const teacher = resolveTeacher(token);
  if (!teacher) {
    fail(res, '未登录或会话已过期', 401, 401);
    return;
  }
  req.teacher = teacher;
  req.sessionToken = token!;
  req.sessionRole = 'teacher';
  next();
}

export function requireStudent(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const student = resolveStudent(token);
  if (!student) {
    fail(res, '请先登录学生账号', 401, 401);
    return;
  }
  req.student = student;
  req.sessionToken = token!;
  req.sessionRole = 'student';
  next();
}

export function optionalTeacher(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const teacher = resolveTeacher(token);
  if (teacher) {
    req.teacher = teacher;
    req.sessionToken = token!;
    req.sessionRole = 'teacher';
  }
  next();
}

export function optionalStudent(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const student = resolveStudent(token);
  if (student) {
    req.student = student;
    req.sessionToken = token!;
    req.sessionRole = 'student';
  }
  next();
}
