import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ code: 0, message: 'ok', data });
}

export function fail(res: Response, message: string, status = 400, code = status) {
  res.status(status).json({ code, message, data: null });
}
