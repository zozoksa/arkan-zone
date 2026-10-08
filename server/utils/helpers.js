import { createHash, randomBytes } from 'node:crypto';

export const nowIso = () => new Date().toISOString();
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('hex');
export const parseJson = (value, fallback = []) => {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
export const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';

/** Human-friendly certificate code: AZ-XXXX-XXXX (no ambiguous characters). */
export function certificateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
  return `AZ-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, offset: (page - 1) * limit };
}
