import { db } from '../config/db.js';
import { nowIso } from '../utils/helpers.js';

export async function notify(userId, { type, title, body = '', link = null }, trx = db) {
  await trx('notifications').insert({ user_id: userId, type, title, body, link, created_at: nowIso() });
}

export async function listNotifications(userId) {
  const rows = await db('notifications').where({ user_id: userId }).orderBy('id', 'desc').limit(30);
  const [{ count }] = await db('notifications').where({ user_id: userId }).whereNull('read_at').count({ count: '*' });
  return {
    unread: Number(count),
    items: rows.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, read: Boolean(n.read_at), createdAt: n.created_at })),
  };
}

export async function markRead(userId, id) {
  const query = db('notifications').where({ user_id: userId }).whereNull('read_at');
  if (id) query.andWhere({ id });
  await query.update({ read_at: nowIso() });
}

export async function logActivity(userId, { type, courseId, lessonId = null }, trx = db) {
  await trx('activity').insert({ user_id: userId, type, course_id: courseId, lesson_id: lessonId, created_at: nowIso() });
}
