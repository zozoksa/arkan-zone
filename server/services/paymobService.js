import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

/**
 * Paymob (Egypt) integration using the Intention API + Unified Checkout.
 * Supports cards, mobile wallets and kiosk payments depending on the
 * integration IDs enabled on your Paymob account.
 * Docs: https://developers.paymob.com
 */
export const paymobEnabled = () =>
  Boolean(env.paymob.secretKey && env.paymob.publicKey && env.paymob.hmacSecret && env.paymob.integrationIds.length);

function splitName(name = '') {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] || 'Student', last: parts.slice(1).join(' ') || 'NA' };
}

export async function createPaymobCheckout({ order, user, course }) {
  const { first, last } = splitName(user.name);
  const amountCents = order.amount * 100;
  const res = await fetch(`${env.paymob.baseUrl}/v1/intention/`, {
    method: 'POST',
    headers: { Authorization: `Token ${env.paymob.secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountCents,
      currency: 'EGP',
      payment_methods: env.paymob.integrationIds,
      items: [{ name: course.title.slice(0, 50), amount: amountCents, description: `Arkan Zone course ${course.id}`, quantity: 1 }],
      billing_data: {
        first_name: first,
        last_name: last,
        email: user.email,
        phone_number: 'NA',
        country: 'EG',
      },
      special_reference: order.id,
      notification_url: `${env.apiPublicUrl}/api/payments/paymob/webhook`,
      redirection_url: `${env.clientUrl}/checkout/result?ref=${order.id}`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.client_secret) {
    console.error('[paymob] intention failed', res.status, data);
    throw new HttpError(502, 'مقدرناش نوصل لبوابة الدفع، حاول تاني بعد شوية');
  }
  return {
    providerRef: String(data.id || ''),
    redirectUrl: `${env.paymob.baseUrl}/unifiedcheckout/?publicKey=${encodeURIComponent(env.paymob.publicKey)}&clientSecret=${encodeURIComponent(data.client_secret)}`,
  };
}

/* Field order defined by Paymob for the transaction HMAC. */
const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction', 'id', 'integration_id',
  'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment', 'is_voided', 'order.id',
  'owner', 'pending', 'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
];

const pick = (obj, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), obj);

function safeEqualHex(a, b) {
  const x = Buffer.from(String(a || ''), 'utf8');
  const y = Buffer.from(String(b || ''), 'utf8');
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(values) {
  return createHmac('sha512', env.paymob.hmacSecret).update(values.map((v) => (v == null ? '' : String(v))).join('')).digest('hex');
}

/** Verifies the server-to-server callback (POST body.obj + ?hmac=). */
export function verifyTransactionHmac(obj, hmac) {
  if (!env.paymob.hmacSecret || !obj) return false;
  return safeEqualHex(sign(HMAC_FIELDS.map((f) => pick(obj, f))), hmac);
}

/** Verifies the browser redirect (flat query string; "order.id" is sent as "order"). */
export function verifyRedirectHmac(query) {
  if (!env.paymob.hmacSecret) return false;
  const values = HMAC_FIELDS.map((f) => (f === 'order.id' ? query.order : query[f]));
  return safeEqualHex(sign(values), query.hmac);
}

const asBool = (v) => v === true || v === 'true';

/** Normalises either payload into { orderId, success, pending, transactionId }. */
export function readTransaction(objOrQuery, { flat = false } = {}) {
  if (flat) {
    return {
      orderId: objOrQuery.merchant_order_id || objOrQuery.special_reference,
      success: asBool(objOrQuery.success),
      pending: asBool(objOrQuery.pending),
      transactionId: objOrQuery.id,
    };
  }
  return {
    orderId: objOrQuery?.order?.merchant_order_id || objOrQuery?.special_reference || objOrQuery?.payment_key_claims?.extra?.order_id,
    success: asBool(objOrQuery?.success),
    pending: asBool(objOrQuery?.pending),
    transactionId: objOrQuery?.id,
  };
}
