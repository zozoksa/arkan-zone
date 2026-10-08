import { db } from '../config/db.js';
import { HttpError } from '../utils/HttpError.js';
import { nowIso, paginate, toBool } from '../utils/helpers.js';
import { toPublicUser } from './authService.js';
import { toOrder } from './checkoutService.js';

const count = async (q) => Number((await q.count({ c: '*' }))[0].c);

export async function stats() {
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const since14 = new Date(Date.now() - 13 * 864e5);
  since14.setHours(0, 0, 0, 0);

  const [users, newUsers, enrollments, paidOrders, pendingOrders, revenueRow, unreadMessages] = await Promise.all([
    count(db('users')),
    count(db('users').where('created_at', '>=', since30)),
    count(db('enrollments')),
    count(db('orders').where({ status: 'paid' }).andWhere('amount', '>', 0)),
    count(db('orders').where({ status: 'pending' })),
    db('orders').where({ status: 'paid' }).sum({ total: 'amount' }).first(),
    count(db('contact_messages').where({ handled: false })),
  ]);

  const paidRecent = await db('orders').where({ status: 'paid' }).andWhere('paid_at', '>=', since14.toISOString()).select('amount', 'paid_at');
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since14);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = days.map((day) => ({
    day,
    total: paidRecent.filter((o) => o.paid_at.slice(0, 10) === day).reduce((s, o) => s + o.amount, 0),
  }));

  const topCourses = await db('enrollments as e')
    .join('courses as c', 'c.id', 'e.course_id')
    .groupBy('c.id', 'c.title')
    .select('c.id', 'c.title')
    .count({ enrollments: 'e.id' })
    .orderBy('enrollments', 'desc')
    .limit(5);

  const recentOrders = await db('orders as o')
    .join('courses as c', 'c.id', 'o.course_id')
    .join('users as u', 'u.id', 'o.user_id')
    .orderBy('o.created_at', 'desc')
    .limit(6)
    .select('o.*', 'c.title as course_title', 'u.name as user_name', 'u.email as user_email');

  return {
    users,
    newUsers,
    enrollments,
    paidOrders,
    pendingOrders,
    revenue: Number(revenueRow?.total) || 0,
    unreadMessages,
    revenueByDay,
    topCourses: topCourses.map((c) => ({ id: c.id, title: c.title, enrollments: Number(c.enrollments) })),
    recentOrders: recentOrders.map(toOrder),
  };
}

export async function listUsers(query) {
  const { page, limit, offset } = paginate(query);
  const base = db('users');
  if (query.search) {
    const term = `%${String(query.search).toLowerCase()}%`;
    base.where((w) => w.whereRaw('lower(name) like ?', [term]).orWhereRaw('lower(email) like ?', [term]));
  }
  if (query.role) base.andWhere({ role: query.role });
  const total = await count(base.clone());
  const rows = await base.clone().orderBy('created_at', 'desc').limit(limit).offset(offset);
  const ids = rows.map((r) => r.id);
  const enrollCounts = ids.length
    ? await db('enrollments').whereIn('user_id', ids).select('user_id').count({ c: '*' }).groupBy('user_id')
    : [];
  const map = Object.fromEntries(enrollCounts.map((r) => [r.user_id, Number(r.c)]));
  return {
    items: rows.map((u) => ({ ...toPublicUser(u), enrollments: map[u.id] || 0 })),
    meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function setUserRole(actor, id, role) {
  if (actor.id === id) throw new HttpError(400, 'مينفعش تغيّر صلاحياتك بنفسك');
  const user = await db('users').where({ id }).first();
  if (!user) throw new HttpError(404, 'المستخدم غير موجود');
  await db('users').where({ id }).update({ role, updated_at: nowIso() });
  return toPublicUser({ ...user, role });
}

export async function listOrders(query) {
  const { page, limit, offset } = paginate(query);
  const base = db('orders as o').join('courses as c', 'c.id', 'o.course_id').join('users as u', 'u.id', 'o.user_id');
  if (query.status) base.where('o.status', query.status);
  const total = await count(base.clone());
  const rows = await base.clone().orderBy('o.created_at', 'desc').limit(limit).offset(offset).select('o.*', 'c.title as course_title', 'u.name as user_name', 'u.email as user_email');
  return { items: rows.map(toOrder), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function listMessages() {
  const rows = await db('contact_messages').orderBy('created_at', 'desc').limit(200);
  return rows.map((m) => ({ id: m.id, name: m.name, email: m.email, message: m.message, handled: toBool(m.handled), createdAt: m.created_at }));
}

export async function setMessageHandled(id, handled) {
  const updated = await db('contact_messages').where({ id }).update({ handled });
  if (!updated) throw new HttpError(404, 'الرسالة غير موجودة');
}

const toCoupon = (c) => ({
  code: c.code,
  percent: c.percent,
  maxUses: c.max_uses,
  usedCount: c.used_count,
  expiresAt: c.expires_at,
  active: toBool(c.active),
  createdAt: c.created_at,
});

export async function listCoupons() {
  return (await db('coupons').orderBy('created_at', 'desc')).map(toCoupon);
}

export async function createCoupon({ code, percent, maxUses, expiresAt }) {
  const normalized = code.trim().toUpperCase();
  if (await db('coupons').where({ code: normalized }).first()) throw new HttpError(409, 'الكود ده موجود', { code: 'الكود ده موجود' });
  const row = { code: normalized, percent, max_uses: maxUses ?? null, used_count: 0, expires_at: expiresAt || null, active: true, created_at: nowIso() };
  await db('coupons').insert(row);
  return toCoupon(row);
}

export async function updateCoupon(code, { active }) {
  const updated = await db('coupons').where({ code }).update({ active });
  if (!updated) throw new HttpError(404, 'الكود غير موجود');
}

export async function deleteCoupon(code) {
  const used = await db('orders').where({ coupon_code: code }).first();
  if (used) throw new HttpError(409, 'الكود ده اتستخدم في طلبات، وقّفه بدل ما تمسحه');
  await db('coupons').where({ code }).delete();
}
