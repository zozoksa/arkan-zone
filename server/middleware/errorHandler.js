import multer from 'multer';
import { HttpError } from '../utils/HttpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `المسار ${req.method} ${req.originalUrl} غير موجود`));
}

// Express 5 forwards rejected promises from async handlers here automatically.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'حجم الصورة أكبر من 2 ميجا' : 'ملف غير صالح';
    return res.status(400).json({ message });
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ message: 'بيانات الطلب غير صالحة' });
  const status = err instanceof HttpError ? err.status : err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 ? 'حدث خطأ في الخادم، حاول مرة تانية.' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
