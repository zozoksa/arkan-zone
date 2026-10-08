import * as admin from '../services/adminService.js';

export const stats = async (_req, res) => res.json({ data: await admin.stats() });
export const users = async (req, res) => res.json(await admin.listUsers(req.query).then(({ items, meta }) => ({ data: items, meta })));
export const setRole = async (req, res) => res.json({ data: await admin.setUserRole(req.user, req.params.id, req.body.role) });
export const orders = async (req, res) => res.json(await admin.listOrders(req.query).then(({ items, meta }) => ({ data: items, meta })));
export const messages = async (_req, res) => res.json({ data: await admin.listMessages() });
export const setHandled = async (req, res) => {
  await admin.setMessageHandled(Number(req.params.id), req.body.handled);
  res.json({ data: { ok: true } });
};
export const coupons = async (_req, res) => res.json({ data: await admin.listCoupons() });
export const createCoupon = async (req, res) => res.status(201).json({ data: await admin.createCoupon(req.body) });
export const updateCoupon = async (req, res) => {
  await admin.updateCoupon(req.params.code, req.body);
  res.json({ data: { ok: true } });
};
export const deleteCoupon = async (req, res) => {
  await admin.deleteCoupon(req.params.code);
  res.status(204).end();
};
