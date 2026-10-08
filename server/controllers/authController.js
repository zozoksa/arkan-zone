import * as auth from '../services/authService.js';

export const register = async (req, res) => res.status(201).json({ data: await auth.register(req.body) });
export const login = async (req, res) => res.json({ data: await auth.login(req.body) });
export const me = (req, res) => res.json({ data: auth.toPublicUser(req.user) });
export const forgot = async (req, res) => {
  await auth.forgotPassword(req.body);
  res.json({ data: { sent: true } });
};
export const reset = async (req, res) => res.json({ data: await auth.resetPassword(req.body) });
export const verify = async (req, res) => res.json({ data: await auth.verifyEmail(req.body) });
export const resend = async (req, res) => {
  await auth.resendVerification(req.user);
  res.json({ data: { sent: true } });
};
