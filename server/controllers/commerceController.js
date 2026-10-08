import * as checkout from '../services/checkoutService.js';
import { enrollFree } from '../services/learningService.js';
import { getCertificate } from '../services/learningService.js';
import { submitContact } from '../services/contactService.js';

export const enroll = async (req, res) => {
  const result = await enrollFree(req.user, req.body.courseId);
  res.status(result.created ? 201 : 200).json({ data: { courseId: result.courseId }, meta: { alreadyEnrolled: !result.created } });
};
export const quote = async (req, res) => res.json({ data: (await checkout.quote(req.validated.courseId, req.validated.coupon)).summary });
export const start = async (req, res) => res.json({ data: await checkout.startCheckout(req.user, req.body) });
export const order = async (req, res) => res.json({ data: await checkout.getOrder(req.user, req.params.id) });
export const confirmRedirect = async (req, res) =>
  res.json({ data: await checkout.confirmPaymobRedirect(req.user, req.params.id, req.body?.params || {}) });
export const mockPay = async (req, res) => res.json({ data: await checkout.completeMockPayment(req.user, req.params.id, req.body) });
export const paymobWebhook = async (req, res) => {
  await checkout.handlePaymobWebhook(req.body, req.query.hmac);
  res.json({ received: true });
};
export const certificate = async (req, res) => res.json({ data: await getCertificate(req.params.code) });
export const contact = async (req, res) => {
  await submitContact(req.body);
  res.status(201).json({ data: { sent: true } });
};
