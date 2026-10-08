import * as auth from '../services/authService.js';
import * as learning from '../services/learningService.js';
import * as notifications from '../services/notificationService.js';
import { listUserOrders } from '../services/checkoutService.js';
import { getCoursesByIds } from '../services/courseService.js';
import { HttpError } from '../utils/HttpError.js';
import { db } from '../config/db.js';

export const updateProfile = async (req, res) => res.json({ data: await auth.updateProfile(req.user, req.body) });
export const changePassword = async (req, res) => {
  await auth.changePassword(req.user, req.body);
  res.json({ data: { updated: true } });
};
export const uploadAvatar = async (req, res) => {
  if (!req.file) throw new HttpError(400, 'اختار صورة');
  res.json({ data: await auth.setAvatar(req.user, req.file) });
};
export const learningState = async (req, res) => res.json({ data: await learning.learningState(req.user.id) });
export const openLesson = async (req, res) => {
  await learning.openLesson(req.user, req.body);
  res.json({ data: { ok: true } });
};
export const completeLesson = async (req, res) => res.json({ data: await learning.completeLesson(req.user, req.body) });
export const addFavorite = async (req, res) => {
  await learning.setFavorite(req.user, req.params.courseId, true);
  res.json({ data: { favorite: true } });
};
export const removeFavorite = async (req, res) => {
  await learning.setFavorite(req.user, req.params.courseId, false);
  res.json({ data: { favorite: false } });
};
export const orders = async (req, res) => res.json({ data: await listUserOrders(req.user.id) });
export const listNotifications = async (req, res) => res.json({ data: await notifications.listNotifications(req.user.id) });
export const readNotification = async (req, res) => {
  await notifications.markRead(req.user.id, Number(req.params.id));
  res.json({ data: { ok: true } });
};
export const readAllNotifications = async (req, res) => {
  await notifications.markRead(req.user.id);
  res.json({ data: { ok: true } });
};

/** Legacy endpoint from the prototype spec: GET /api/users/:id/courses (self or admin). */
export const userCourses = async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') throw new HttpError(403, 'غير مسموح');
  const rows = await db('enrollments').where({ user_id: req.params.id });
  const list = await getCoursesByIds(rows.map((r) => r.course_id));
  const at = Object.fromEntries(rows.map((r) => [r.course_id, r.enrolled_at]));
  res.json({ data: list.map((c) => ({ ...c, enrolledAt: at[c.id] })) });
};
