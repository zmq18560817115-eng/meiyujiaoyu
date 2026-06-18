import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { ensureUploadsDir, UPLOADS_DIR, newId } from '../lib/store.js';
import { ok, fail } from '../lib/response.js';

const router = Router();

router.post('/', (req, res) => {
  const { base64, filename, mimeType } = req.body as {
    base64?: string;
    filename?: string;
    mimeType?: string;
  };

  if (!base64) {
    fail(res, '缺少 base64 文件内容');
    return;
  }

  const match = base64.match(/^data:([^;]+);base64,(.+)$/);
  const data = match ? match[2] : base64;
  const mime = match ? match[1] : mimeType || 'image/png';

  const ext =
    filename?.split('.').pop() ||
    (mime.includes('jpeg') ? 'jpg' : mime.includes('png') ? 'png' : 'bin');

  ensureUploadsDir();
  const fileId = newId('file');
  const safeName = `${fileId}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, safeName);

  try {
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  } catch {
    fail(res, '文件保存失败', 500, 500);
    return;
  }

  ok(res, {
    fileId,
    url: `/uploads/${safeName}`,
    mimeType: mime,
  }, 201);
});

export default router;
