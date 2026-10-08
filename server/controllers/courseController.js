import * as courses from '../services/courseService.js';
import { lessonPlayback } from '../services/videoService.js';

export const list = async (req, res) => {
  const data = await courses.listCourses(req.query);
  res.json({ data, meta: { total: data.length } });
};
export const show = async (req, res) => res.json({ data: await courses.getCourse(req.params.id) });
export const related = async (req, res) =>
  res.json({ data: await courses.relatedCourses(req.params.id, Math.min(Number(req.query.limit) || 4, 12)) });
export const categories = async (_req, res) => res.json({ data: await courses.listCategories() });
export const levels = (_req, res) => res.json({ data: courses.LEVELS });
export const review = async (req, res) => res.status(201).json({ data: await courses.addReview(req.user, req.params.id, req.body) });
export const playback = async (req, res) => {
  const row = await courses.findCourseRow(req.params.id);
  res.json({ data: await lessonPlayback(req.user, row?.id ?? req.params.id, req.params.lessonId) });
};
