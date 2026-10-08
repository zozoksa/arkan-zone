import { randomUUID } from 'node:crypto';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import { nowIso } from '../utils/helpers.js';
import { findCourseRow } from './courseService.js';
import { enrollUser } from './learningService.js';
import { notify } from './notificationService.js';
import { emails } from './emailService.js';
import { createPaymobCheckout, paymobEnabled, readTransaction, verifyRedirectHmac, verifyTransactionHmac } from './paymobService.js';

export function paymentMode() {
  if (paymobEnabled()) return 'paymob';
  if (env.allowMockPayments) return 'mock';
  return 'disabled';
}

async function findCoupon(code) {
  if (!code) return null;
  const coupon = await db('coupons').where({ code: code.trim().toUpperCase() }).first();
  const invalid = () => new HttpError(422, 'كود الخصم غير صالح', { coupon: 'كود الخصم غير صالح أو منتهي' });
  if (!coupon || !coupon.active) throw invalid();
  if (coupon.expires_at && coupon.expires_at < nowIso()) throw invalid();
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) throw invalid();
  return coupon;
}

export async function quote(courseId, couponCode) {
  const course = await findCourseRow(String(courseId));
  if (!course) throw new HttpError(404, 'الكورس غير موجود');
  const coupon = await findCoupon(couponCode);
  const discount = coupon ? Math.round((course.price * coupon.percent) / 100) : 0;
  return {
    course,
    coupon,
    summary: {
      courseId: course.id,
      price: course.price,
      discount,
      total: Math.max(0, course.price - discount),
      coupon: coupon ? { code: coupon.code, percent: coupon.percent } : null,
      currency: 'EGP',
      paymentMode: paymentMode(),
    },
  };
}

/** Marks an order paid exactly once and grants access. */
export async function markOrderPaid(orderId, providerRef) {
  let paidOrder = null;
  await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    if (!order || order.status === 'paid') return;
    const paidAt = nowIso();
    await trx('orders').where({ id: orderId }).update({ status: 'paid', paid_at: paidAt, provider_ref: providerRef || order.provider_ref });
    if (order.coupon_code) await trx('coupons').where({ code: order.coupon_code }).increment('used_count', 1);
    await enrollUser(order.user_id, order.course_id, { orderId, trx });
    const course = await trx('courses').where({ id: order.course_id }).first();
    await notify(order.user_id, { type: 'payment', title: `تم الدفع والاشتراك في ${course.title}`, body: `رقم الطلب ${order.id}`, link: `/learn/${course.id}` }, trx);
    paidOrder = { ...order, status: 'paid', paid_at: paidAt, course };
  });
  if (paidOrder) {
    const user = await db('users').where({ id: paidOrder.user_id }).first();
    emails.receipt(user, paidOrder, paidOrder.course);
  }
}

async function markOrderFailed(orderId) {
  await db('orders').where({ id: orderId, status: 'pending' }).update({ status: 'failed' });
}

export async function startCheckout(user, { courseId, coupon }) {
  const { course, coupon: couponRow, summary } = await quote(courseId, coupon);

  if (await db('enrollments').where({ user_id: user.id, course_id: course.id }).first()) {
    return { status: 'enrolled', courseId: course.id };
  }

  const order = {
    id: randomUUID(),
    user_id: user.id,
    course_id: course.id,
    amount: summary.total,
    original_amount: course.price,
    discount: summary.discount,
    coupon_code: couponRow?.code || null,
    currency: 'EGP',
    status: 'pending',
    provider: summary.total === 0 ? (course.price === 0 ? 'free' : 'coupon') : paymentMode(),
    created_at: nowIso(),
  };

  if (summary.total === 0) {
    await db('orders').insert(order);
    await markOrderPaid(order.id);
    return { status: 'enrolled', courseId: course.id, orderId: order.id };
  }

  if (order.provider === 'disabled') throw new HttpError(503, 'الدفع الإلكتروني مش متاح حاليًا');
  await db('orders').insert(order);

  if (order.provider === 'paymob') {
    const { providerRef, redirectUrl } = await createPaymobCheckout({ order, user, course });
    await db('orders').where({ id: order.id }).update({ provider_ref: providerRef });
    return { status: 'redirect', orderId: order.id, redirectUrl };
  }
  return { status: 'redirect', orderId: order.id, redirectUrl: `${env.clientUrl}/checkout/mock/${order.id}` };
}

export async function getOrder(user, orderId) {
  const order = await db('orders as o')
    .join('courses as c', 'c.id', 'o.course_id')
    .where('o.id', orderId)
    .select('o.*', 'c.title as course_title')
    .first();
  if (!order || (order.user_id !== user.id && user.role !== 'admin')) throw new HttpError(404, 'الطلب غير موجود');
  return toOrder(order);
}

export const toOrder = (o) => ({
  id: o.id,
  courseId: o.course_id,
  courseTitle: o.course_title,
  amount: o.amount,
  originalAmount: o.original_amount,
  discount: o.discount,
  coupon: o.coupon_code,
  currency: o.currency,
  status: o.status,
  provider: o.provider,
  createdAt: o.created_at,
  paidAt: o.paid_at,
  ...(o.user_name ? { userName: o.user_name, userEmail: o.user_email } : {}),
});

export async function listUserOrders(userId) {
  const rows = await db('orders as o').join('courses as c', 'c.id', 'o.course_id').where('o.user_id', userId).orderBy('o.created_at', 'desc').select('o.*', 'c.title as course_title');
  return rows.map(toOrder);
}

/* ---- Paymob callbacks ---- */
export async function handlePaymobWebhook(body, hmac) {
  const obj = body?.obj;
  if (!verifyTransactionHmac(obj, hmac)) throw new HttpError(401, 'invalid hmac');
  const tx = readTransaction(obj);
  if (!tx.orderId || tx.pending) return;
  if (tx.success) await markOrderPaid(tx.orderId, String(tx.transactionId));
  else await markOrderFailed(tx.orderId);
}

/** Used by the result page; lets local setups confirm a payment without a public webhook URL. */
export async function confirmPaymobRedirect(user, orderId, query) {
  if (paymentMode() !== 'paymob' || !query?.hmac) return getOrder(user, orderId);
  if (!verifyRedirectHmac(query)) throw new HttpError(400, 'بيانات الدفع غير صالحة');
  const tx = readTransaction(query, { flat: true });
  if (tx.orderId && tx.orderId !== orderId) throw new HttpError(400, 'بيانات الدفع لا تطابق الطلب');
  if (!tx.pending) {
    if (tx.success) await markOrderPaid(orderId, String(tx.transactionId));
    else await markOrderFailed(orderId);
  }
  return getOrder(user, orderId);
}

/* ---- Mock provider (development only) ---- */
export async function completeMockPayment(user, orderId, { success }) {
  if (paymentMode() !== 'mock') throw new HttpError(404, 'غير متاح');
  const order = await db('orders').where({ id: orderId, user_id: user.id }).first();
  if (!order) throw new HttpError(404, 'الطلب غير موجود');
  if (order.status === 'pending') {
    if (success) await markOrderPaid(order.id, `mock_${Date.now()}`);
    else await markOrderFailed(order.id);
  }
  return getOrder(user, orderId);
}
