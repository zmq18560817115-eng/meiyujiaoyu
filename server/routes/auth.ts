import { Router } from 'express';
import { DEFAULT_STUDENTS, DEFAULT_TEACHERS } from '../../src/data/accounts.js';
import {
  findStudentInRoster,
  resolveStudentGradeLabel,
} from '../lib/accounts.js';
import { loadStore, mutateStore, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';
import {
  getBearerToken,
  resolveTeacher,
  resolveStudent,
  requireTeacher,
  requireStudent,
  type AuthedRequest,
} from '../lib/auth.js';

const router = Router();

/** 登录页展示用名册（不含密码） */
router.get('/roster', (_req, res) => {
  const store = loadStore();
  ok(res, {
    teachers: store.teachers.map((t) => ({
      workId: t.workId,
      name: t.name,
      school: DEFAULT_TEACHERS.find((d) => d.workId === t.workId)?.school,
      title: DEFAULT_TEACHERS.find((d) => d.workId === t.workId)?.title,
    })),
    students: (store.students ?? []).map((s) => ({
      id: s.id,
      studentNo: s.studentNo,
      name: s.name,
      classCode: s.classCode,
      grade: s.grade,
    })),
  });
});

router.post('/teacher/login', (req, res) => {
  const { workId, password } = req.body as { workId?: string; password?: string };
  if (!workId?.trim()) {
    fail(res, '请输入教师工号');
    return;
  }

  const store = loadStore();
  const teacher = store.teachers.find((t) => t.workId === workId.trim());
  if (!teacher) {
    fail(res, '工号不存在', 401, 401);
    return;
  }

  if (password && teacher.password && password !== teacher.password) {
    fail(res, '密码错误', 401, 401);
    return;
  }

  const token = newId('sess');
  mutateStore((s) => {
    s.sessions[token] = {
      teacherId: teacher.id,
      name: teacher.name,
      createdAt: Date.now(),
    };
  });

  ok(res, {
    token,
    role: 'teacher',
    teacher: { id: teacher.id, workId: teacher.workId, name: teacher.name },
  });
});

router.get('/me', (req, res) => {
  const token = getBearerToken(req);
  const teacher = resolveTeacher(token);
  if (teacher) {
    ok(res, { role: 'teacher', teacher });
    return;
  }
  const student = resolveStudent(token);
  if (student) {
    ok(res, { role: 'student', student });
    return;
  }
  fail(res, '未登录', 401, 401);
});

router.post('/logout', (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    ok(res, { loggedOut: true });
    return;
  }
  mutateStore((s) => {
    delete s.sessions[token];
    if (s.studentSessions) delete s.studentSessions[token];
  });
  ok(res, { loggedOut: true });
});

router.post('/student/login', (req, res) => {
  const { name, grade, classCode, studentNo, studentId, password } = req.body as {
    name?: string;
    grade?: string;
    classCode?: string;
    studentNo?: string;
    studentId?: string;
    password?: string;
  };

  if (!studentId?.trim() && !studentNo?.trim() && !name?.trim()) {
    fail(res, '请选择学生或输入学号');
    return;
  }

  const store = loadStore();
  const rosterStudent = findStudentInRoster(store, {
    studentId,
    name,
    studentNo,
    classCode,
    grade,
  });

  if (!rosterStudent) {
    fail(
      res,
      '未在班级名册中找到该学生，请从下拉列表选择或核对学号',
      401,
      401,
    );
    return;
  }

  if (
    password &&
    rosterStudent.password &&
    password !== rosterStudent.password
  ) {
    fail(res, '学生密码错误', 401, 401);
    return;
  }

  if (rosterStudent.password && !password) {
    fail(res, '请输入学生密码（演示默认 stu123）', 401, 401);
    return;
  }

  const gradeLabel =
    rosterStudent.grade ||
    resolveStudentGradeLabel(classCode, grade);

  const token = newId('stud-sess');

  mutateStore((s) => {
    if (!s.studentSessions) s.studentSessions = {};
    s.studentSessions[token] = {
      studentId: rosterStudent.id,
      name: rosterStudent.name,
      grade: gradeLabel,
      createdAt: Date.now(),
    };
  });

  ok(res, {
    token,
    role: 'student',
    student: {
      id: rosterStudent.id,
      name: rosterStudent.name,
      grade: gradeLabel,
      studentNo: rosterStudent.studentNo,
    },
  });
});

router.get('/student/me', requireStudent, (req: AuthedRequest, res) => {
  ok(res, { student: req.student });
});

router.post('/student/logout', requireStudent, (req: AuthedRequest, res) => {
  const token = req.sessionToken!;
  mutateStore((s) => {
    if (s.studentSessions) delete s.studentSessions[token];
  });
  ok(res, { loggedOut: true });
});

export default router;
