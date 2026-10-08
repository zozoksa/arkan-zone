import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../config/db.js';
import { HttpError } from '../utils/HttpError.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function resolveUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return (await db('users').where({ id: payload.sub }).first()) || null;
  } catch {
    return null;
  }
}

/** Requires a valid token; the fresh user row (role included) is loaded on every request. */
export async function requireAuth(req, _res, next) {
  const user = await resolveUser(req);
  if (!user) throw new HttpError(401, 'سجّل دخولك الأول');
  req.user = user;
  next();
}

export async function optionalAuth(req, _res, next) {
  req.user = await resolveUser(req);
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') throw new HttpError(403, 'الصفحة دي للإدارة بس');
  next();
}
