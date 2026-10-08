import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HttpError } from '../utils/HttpError.js';

export const UPLOAD_ROOT = fileURLToPath(new URL('../uploads', import.meta.url));
const avatarDir = path.join(UPLOAD_ROOT, 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });

const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: avatarDir,
    filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${ext[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    ext[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'الصورة لازم تكون JPG أو PNG أو WEBP')),
}).single('avatar');
