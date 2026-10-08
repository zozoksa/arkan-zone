import { createHash } from 'node:crypto';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import { toBool } from '../utils/helpers.js';

/**
 * Bunny Stream playback. With "Token Authentication" enabled on the library,
 * embed URLs are signed and expire, so they can't be shared or hot-linked.
 */
export async function lessonPlayback(user, courseId, lessonId) {
  const lesson = await db('lessons').where({ id: lessonId, course_id: courseId }).first();
  if (!lesson) throw new HttpError(404, 'الدرس غير موجود');

  const enrolled = user && (await db('enrollments').where({ user_id: user.id, course_id: courseId }).first());
  if (!toBool(lesson.preview) && !enrolled && user?.role !== 'admin') throw new HttpError(403, 'اشترك في الكورس عشان تشوف الدرس ده');

  if (!lesson.video_id || !env.bunny.libraryId) return { provider: null };

  const base = `https://iframe.mediadelivery.net/embed/${env.bunny.libraryId}/${lesson.video_id}`;
  const params = new URLSearchParams({ autoplay: 'false', preload: 'true', responsive: 'true' });
  if (env.bunny.tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + 3 * 3600;
    const token = createHash('sha256').update(env.bunny.tokenKey + lesson.video_id + expires).digest('hex');
    params.set('token', token);
    params.set('expires', String(expires));
  }
  return { provider: 'bunny', embedUrl: `${base}?${params}` };
}
