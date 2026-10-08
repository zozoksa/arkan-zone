import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

process.env.NODE_ENV = 'test';
if (!process.env.DB_CLIENT || process.env.DB_CLIENT === 'better-sqlite3') process.env.DB_FILENAME = ':memory:';
process.env.SEED_DEMO = 'true';
process.env.PAYMOB_HMAC_SECRET = 'test-hmac';

const { default: request } = await import('supertest');
const { createApp } = await import('../app.js');
const { prepareDatabase, db } = await import('../db/index.js');
const { verifyTransactionHmac } = await import('../services/paymobService.js');

let app;
let token;
let adminToken;
const auth = (t) => ({ Authorization: `Bearer ${t}` });

before(async () => {
  await prepareDatabase({ log: false });
  app = createApp();
});
after(() => db.destroy());

test('catalogue: list, filter, detail, related, categories', async () => {
  const list = await request(app).get('/api/courses').expect(200);
  assert.equal(list.body.data.length, 13);
  assert.ok(list.body.data[0].curriculum.length > 0);
  assert.equal(list.body.data[0].curriculum[0].lessons[0].video_id, undefined, 'video ids must stay private');

  const ai = await request(app).get('/api/courses?category=ai&sort=rating').expect(200);
  assert.deepEqual(ai.body.data.map((c) => c.id), ['13', '5']);

  const bySlug = await request(app).get('/api/courses/react-for-developers').expect(200);
  assert.equal(bySlug.body.data.id, '3');
  assert.ok(bySlug.body.data.reviews.length > 0);

  await request(app).get('/api/courses/999').expect(404);
  const related = await request(app).get('/api/courses/3/related').expect(200);
  assert.equal(related.body.data.length, 4);
  const cats = await request(app).get('/api/categories').expect(200);
  assert.equal(cats.body.data.find((c) => c.id === 'programming').courseCount, 4);
});

test('auth: register, validation, duplicate, login, me', async () => {
  const bad = await request(app).post('/api/auth/register').send({ name: 'a', email: 'x', password: '1' }).expect(422);
  assert.ok(bad.body.details.name && bad.body.details.email && bad.body.details.password);

  const reg = await request(app).post('/api/auth/register').send({ name: 'سارة أحمد', email: 'Sara@Test.com', password: 'secret12' }).expect(201);
  assert.equal(reg.body.data.user.email, 'sara@test.com');
  assert.equal(reg.body.data.user.emailVerified, false);
  token = reg.body.data.token;

  await request(app).post('/api/auth/register').send({ name: 'سارة', email: 'sara@test.com', password: 'secret12' }).expect(409);
  await request(app).post('/api/auth/login').send({ email: 'sara@test.com', password: 'wrong' }).expect(401);
  await request(app).post('/api/auth/login').send({ email: 'sara@test.com', password: 'secret12' }).expect(200);
  await request(app).get('/api/auth/me').expect(401);
  const me = await request(app).get('/api/auth/me').set(auth(token)).expect(200);
  assert.equal(me.body.data.name, 'سارة أحمد');

  const admin = await request(app).post('/api/auth/login').send({ email: 'admin@arkanzone.com', password: 'Admin@12345' }).expect(200);
  adminToken = admin.body.data.token;
  assert.equal(admin.body.data.user.role, 'admin');
});

test('auth: password reset and email verification with one-time tokens', async () => {
  const { sha256 } = await import('../utils/helpers.js');
  const user = await db('users').where({ email: 'sara@test.com' }).first();

  // Simulate the emailed tokens by inserting known ones.
  const now = new Date().toISOString();
  const later = new Date(Date.now() + 3600e3).toISOString();
  await db('auth_tokens').insert({ user_id: user.id, type: 'reset', token_hash: sha256('reset-token-123'), expires_at: later, created_at: now });
  await db('auth_tokens').insert({ user_id: user.id, type: 'verify', token_hash: sha256('verify-token-123'), expires_at: later, created_at: now });

  await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@test.com' }).expect(200);
  await request(app).post('/api/auth/reset-password').send({ token: 'reset-token-123', password: 'newpass12' }).expect(200);
  await request(app).post('/api/auth/reset-password').send({ token: 'reset-token-123', password: 'again123' }).expect(400);
  const login = await request(app).post('/api/auth/login').send({ email: 'sara@test.com', password: 'newpass12' }).expect(200);
  token = login.body.data.token;

  const v = await request(app).post('/api/auth/verify-email').send({ token: 'verify-token-123' }).expect(200);
  assert.equal(v.body.data.emailVerified, true);
});

test('free enrolment, progress, certificate, review', async () => {
  await request(app).post('/api/enroll').set(auth(token)).send({ courseId: '2' }).expect(402);
  await request(app).post('/api/enroll').send({ courseId: '12' }).expect(401);
  await request(app).post('/api/enroll').set(auth(token)).send({ courseId: '12' }).expect(201);
  await request(app).post('/api/enroll').set(auth(token)).send({ courseId: '12' }).expect(200);

  const course = (await request(app).get('/api/courses/12')).body.data;
  const lessons = course.curriculum.flatMap((s) => s.lessons);
  let certificate = null;
  for (const l of lessons) {
    const r = await request(app).post('/api/me/lessons/complete').set(auth(token)).send({ courseId: '12', lessonId: l.id }).expect(200);
    certificate = r.body.data.certificate || certificate;
  }
  assert.match(certificate, /^AZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

  const state = (await request(app).get('/api/me/learning').set(auth(token)).expect(200)).body.data;
  assert.equal(state.enrollments['12'].completedLessons.length, lessons.length);
  assert.ok(state.enrollments['12'].completedAt);
  assert.equal(state.certificates['12'], certificate);
  assert.ok(state.activity.some((a) => a.type === 'complete'));

  const cert = await request(app).get(`/api/certificates/${certificate}`).expect(200);
  assert.equal(cert.body.data.studentName, 'سارة أحمد');
  await request(app).get('/api/certificates/AZ-NOPE-NOPE').expect(404);

  await request(app).post('/api/courses/2/reviews').set(auth(token)).send({ rating: 5, comment: 'ممتاز جدًا' }).expect(403);
  await request(app).post('/api/courses/12/reviews').set(auth(token)).send({ rating: 9, comment: 'x' }).expect(422);
  await request(app).post('/api/courses/12/reviews').set(auth(token)).send({ rating: 5, comment: 'كورس ممتاز ومفيد' }).expect(201);
  await request(app).post('/api/courses/12/reviews').set(auth(token)).send({ rating: 4, comment: 'تاني مرة' }).expect(409);
});

test('paid checkout: coupon quote, mock payment, ownership, admin stats', async () => {
  const q = await request(app).get('/api/checkout/quote?courseId=2&coupon=welcome20').expect(200);
  assert.equal(q.body.data.price, 850);
  assert.equal(q.body.data.discount, 170);
  assert.equal(q.body.data.total, 680);
  await request(app).get('/api/checkout/quote?courseId=2&coupon=FAKE').expect(422);

  const start = await request(app).post('/api/checkout').set(auth(token)).send({ courseId: '2', coupon: 'WELCOME20' }).expect(200);
  assert.equal(start.body.data.status, 'redirect');
  const orderId = start.body.data.orderId;

  await request(app).post('/api/me/lessons/complete').set(auth(token)).send({ courseId: '2', lessonId: '2-l1' }).expect(403);

  const other = (await request(app).post('/api/auth/register').send({ name: 'غريب', email: 'other@test.com', password: 'secret12' })).body.data.token;
  await request(app).get(`/api/orders/${orderId}`).set(auth(other)).expect(404);

  const paid = await request(app).post(`/api/orders/${orderId}/mock-pay`).set(auth(token)).send({ success: true }).expect(200);
  assert.equal(paid.body.data.status, 'paid');
  const state = (await request(app).get('/api/me/learning').set(auth(token))).body.data;
  assert.ok(state.enrollments['2']);
  const coupon = await db('coupons').where({ code: 'WELCOME20' }).first();
  assert.equal(coupon.used_count, 1);

  const again = await request(app).post('/api/checkout').set(auth(token)).send({ courseId: '2' }).expect(200);
  assert.equal(again.body.data.status, 'enrolled');

  const orders = (await request(app).get('/api/me/orders').set(auth(token)).expect(200)).body.data;
  assert.ok(orders.some((o) => o.id === orderId && o.amount === 680));

  await request(app).get('/api/admin/stats').set(auth(token)).expect(403);
  const stats = (await request(app).get('/api/admin/stats').set(auth(adminToken)).expect(200)).body.data;
  assert.equal(stats.revenue, 680);
  assert.equal(stats.revenueByDay.length, 14);
});

test('favorites, notifications, playback access, profile', async () => {
  await request(app).put('/api/me/favorites/5').set(auth(token)).expect(200);
  await request(app).put('/api/me/favorites/5').set(auth(token)).expect(200);
  let state = (await request(app).get('/api/me/learning').set(auth(token))).body.data;
  assert.deepEqual(state.favorites, ['5']);
  await request(app).delete('/api/me/favorites/5').set(auth(token)).expect(200);
  state = (await request(app).get('/api/me/learning').set(auth(token))).body.data;
  assert.deepEqual(state.favorites, []);

  const n = (await request(app).get('/api/me/notifications').set(auth(token)).expect(200)).body.data;
  assert.ok(n.unread >= 3);
  await request(app).post('/api/me/notifications/read-all').set(auth(token)).expect(200);
  assert.equal((await request(app).get('/api/me/notifications').set(auth(token))).body.data.unread, 0);

  await request(app).get('/api/courses/3/lessons/3-l1/playback').expect(200); // preview lesson
  await request(app).get('/api/courses/3/lessons/3-l5/playback').expect(403);
  await request(app).get('/api/courses/2/lessons/2-l5/playback').set(auth(token)).expect(200);

  await request(app).patch('/api/me').set(auth(token)).send({ email: 'other@test.com' }).expect(409);
  const p = await request(app).patch('/api/me').set(auth(token)).send({ name: 'سارة أحمد علي', bio: 'مطورة ويب' }).expect(200);
  assert.equal(p.body.data.name, 'سارة أحمد علي');
  await request(app).patch('/api/me/password').set(auth(token)).send({ currentPassword: 'bad', newPassword: 'zzzzzz1' }).expect(422);
  await request(app).patch('/api/me/password').set(auth(token)).send({ currentPassword: 'newpass12', newPassword: 'final123' }).expect(200);
});

test('contact + admin management', async () => {
  await request(app).post('/api/contact').send({ name: 'أحمد', email: 'a@b.com', message: 'قصير' }).expect(422);
  await request(app).post('/api/contact').send({ name: 'أحمد', email: 'a@b.com', message: 'عايز أدرّب فريق الشركة عندكم' }).expect(201);

  const msgs = (await request(app).get('/api/admin/messages').set(auth(adminToken)).expect(200)).body.data;
  assert.equal(msgs.length, 1);
  await request(app).patch(`/api/admin/messages/${msgs[0].id}`).set(auth(adminToken)).send({ handled: true }).expect(200);

  const users = await request(app).get('/api/admin/users?search=sara').set(auth(adminToken)).expect(200);
  assert.equal(users.body.data.length, 1);
  assert.equal(users.body.data[0].enrollments, 2);

  const c = await request(app).post('/api/admin/coupons').set(auth(adminToken)).send({ code: 'ramadan', percent: 30, maxUses: 2 }).expect(201);
  assert.equal(c.body.data.code, 'RAMADAN');
  await request(app).post('/api/admin/coupons').set(auth(adminToken)).send({ code: 'RAMADAN', percent: 30 }).expect(409);
  await request(app).patch('/api/admin/coupons/RAMADAN').set(auth(adminToken)).send({ active: false }).expect(200);
  await request(app).get('/api/checkout/quote?courseId=3&coupon=RAMADAN').expect(422);
  await request(app).delete('/api/admin/coupons/WELCOME20').set(auth(adminToken)).expect(409);
  await request(app).delete('/api/admin/coupons/RAMADAN').set(auth(adminToken)).expect(204);

  const orders = await request(app).get('/api/admin/orders?status=paid').set(auth(adminToken)).expect(200);
  assert.ok(orders.body.meta.total >= 1);
});

test('paymob webhook HMAC is verified', async () => {
  const obj = {
    amount_cents: 68000, created_at: '2026-10-01T10:00:00', currency: 'EGP', error_occured: false, has_parent_transaction: false,
    id: 123, integration_id: 1, is_3d_secure: true, is_auth: false, is_capture: false, is_refunded: false,
    is_standalone_payment: true, is_voided: false, order: { id: 99, merchant_order_id: 'x' }, owner: 7, pending: false,
    source_data: { pan: '2346', sub_type: 'MasterCard', type: 'card' }, success: true,
  };
  const fields = ['amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending', 'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'];
  const str = fields.map((f) => f.split('.').reduce((v, k) => v[k], obj)).join('');
  const hmac = createHmac('sha512', 'test-hmac').update(str).digest('hex');
  assert.equal(verifyTransactionHmac(obj, hmac), true);
  assert.equal(verifyTransactionHmac({ ...obj, amount_cents: 1 }, hmac), false);
  await request(app).post('/api/payments/paymob/webhook?hmac=bad').send({ obj }).expect(401);
});
