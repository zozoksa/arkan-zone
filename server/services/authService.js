import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { HttpError } from '../utils/HttpError.js';
import { nowIso, randomToken, sha256 } from '../utils/helpers.js';
import { signToken } from '../middleware/auth.js';
import { emails } from './emailService.js';
import { notify } from './notificationService.js';

export function toPublicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    bio: u.bio || '',
    avatarUrl: u.avatar_url || null,
    emailVerified: Boolean(u.email_verified_at),
    joinedAt: u.created_at,
  };
}

const session = (user) => ({ user: toPublicUser(user), token: signToken(user) });

async function issueToken(userId, type, hours) {
  const token = randomToken();
  await db('auth_tokens').where({ user_id: userId, type }).whereNull('used_at').update({ used_at: nowIso() });
  await db('auth_tokens').insert({
    user_id: userId,
    type,
    token_hash: sha256(token),
    expires_at: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
    created_at: nowIso(),
  });
  return token;
}

async function consumeToken(token, type) {
  const row = await db('auth_tokens').where({ token_hash: sha256(String(token)), type }).whereNull('used_at').first();
  if (!row || row.expires_at < nowIso()) throw new HttpError(400, 'الرابط غير صالح أو انتهت صلاحيته');
  await db('auth_tokens').where({ id: row.id }).update({ used_at: nowIso() });
  return row.user_id;
}

export async function register({ name, email, password }) {
  const normalized = email.trim().toLowerCase();
  if (await db('users').where({ email: normalized }).first()) {
    throw new HttpError(409, 'البريد الإلكتروني ده مسجل قبل كده', { email: 'البريد الإلكتروني ده مسجل قبل كده' });
  }
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalized,
    password_hash: await bcrypt.hash(password, 10),
    role: 'student',
    bio: '',
    created_at: nowIso(),
  };
  await db('users').insert(user);
  await notify(user.id, { type: 'welcome', title: 'أهلًا بيك في Arkan Zone', body: 'ابدأ بأول كورس، وأول درسين في كل كورس مجانًا.', link: '/courses' });
  emails.verify(user, await issueToken(user.id, 'verify', 48));
  return session(user);
}

export async function login({ email, password }) {
  const user = await db('users').where({ email: email.trim().toLowerCase() }).first();
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }
  return session(user);
}

/** Always succeeds from the caller's point of view so emails cannot be enumerated. */
export async function forgotPassword({ email }) {
  const user = await db('users').where({ email: email.trim().toLowerCase() }).first();
  if (user) emails.reset(user, await issueToken(user.id, 'reset', 1));
}

export async function resetPassword({ token, password }) {
  const userId = await consumeToken(token, 'reset');
  await db('users').where({ id: userId }).update({ password_hash: await bcrypt.hash(password, 10), updated_at: nowIso() });
  const user = await db('users').where({ id: userId }).first();
  return session(user);
}

export async function verifyEmail({ token }) {
  const userId = await consumeToken(token, 'verify');
  await db('users').where({ id: userId }).update({ email_verified_at: nowIso() });
  return toPublicUser(await db('users').where({ id: userId }).first());
}

export async function resendVerification(user) {
  if (user.email_verified_at) throw new HttpError(400, 'بريدك متأكد بالفعل');
  emails.verify(user, await issueToken(user.id, 'verify', 48));
}

export async function changePassword(user, { currentPassword, newPassword }) {
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new HttpError(422, 'كلمة المرور الحالية غير صحيحة', { currentPassword: 'كلمة المرور الحالية غير صحيحة' });
  }
  await db('users').where({ id: user.id }).update({ password_hash: await bcrypt.hash(newPassword, 10), updated_at: nowIso() });
}

export async function updateProfile(user, { name, email, bio }) {
  const patch = { updated_at: nowIso() };
  if (name !== undefined) patch.name = name.trim();
  if (bio !== undefined) patch.bio = bio.trim();
  if (email !== undefined && email.trim().toLowerCase() !== user.email) {
    const normalized = email.trim().toLowerCase();
    if (await db('users').where({ email: normalized }).whereNot({ id: user.id }).first()) {
      throw new HttpError(409, 'البريد الإلكتروني ده مستخدم', { email: 'البريد الإلكتروني ده مستخدم' });
    }
    patch.email = normalized;
    patch.email_verified_at = null;
  }
  await db('users').where({ id: user.id }).update(patch);
  const updated = await db('users').where({ id: user.id }).first();
  if (patch.email) emails.verify(updated, await issueToken(updated.id, 'verify', 48));
  return toPublicUser(updated);
}

export async function setAvatar(user, file) {
  const avatarUrl = `/uploads/avatars/${file.filename}`;
  await db('users').where({ id: user.id }).update({ avatar_url: avatarUrl, updated_at: nowIso() });
  return toPublicUser(await db('users').where({ id: user.id }).first());
}
