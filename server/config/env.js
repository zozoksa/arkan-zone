import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_ROOT = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: path.join(SERVER_ROOT, '.env'), quiet: true });

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

function required(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProd) throw new Error(`Missing required environment variable: ${name}`);
  return devFallback;
}

const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export const env = {
  isProd,
  isTest,
  port: Number(process.env.PORT) || 5000,
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, ''),
  apiPublicUrl: (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, ''),
  corsOrigins: list(process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173'),

  db: {
    client: process.env.DB_CLIENT || 'better-sqlite3',
    url: process.env.DATABASE_URL,
    filename:
      process.env.DB_FILENAME === ':memory:'
        ? ':memory:'
        : path.resolve(SERVER_ROOT, process.env.DB_FILENAME || './storage/arkan.sqlite'),
  },

  jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  admin: {
    email: process.env.ADMIN_EMAIL || (isProd ? '' : 'admin@arkanzone.com'),
    password: process.env.ADMIN_PASSWORD || (isProd ? '' : 'Admin@12345'),
    name: process.env.ADMIN_NAME || 'مدير المنصة',
  },
  seedDemo: process.env.SEED_DEMO ? process.env.SEED_DEMO === 'true' : !isProd,

  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'Arkan Zone <no-reply@arkanzone.com>',
    contactInbox: process.env.CONTACT_INBOX || process.env.ADMIN_EMAIL || 'hello@arkanzone.com',
  },

  paymob: {
    secretKey: process.env.PAYMOB_SECRET_KEY,
    publicKey: process.env.PAYMOB_PUBLIC_KEY,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET,
    integrationIds: list(process.env.PAYMOB_INTEGRATION_IDS).map(Number).filter(Boolean),
    baseUrl: process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com',
  },
  // "mock" lets you test checkout locally without a payment provider. Never allowed in production.
  allowMockPayments: !isProd && process.env.ALLOW_MOCK_PAYMENTS !== 'false',

  bunny: {
    libraryId: process.env.BUNNY_LIBRARY_ID,
    tokenKey: process.env.BUNNY_TOKEN_KEY,
  },
};
