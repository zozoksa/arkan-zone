import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { message },
  });

export const generalLimiter = make(15 * 60 * 1000, 600, 'طلبات كتير، استنى شوية وحاول تاني');
export const authLimiter = make(15 * 60 * 1000, 20, 'محاولات كتير، استنى 15 دقيقة وحاول تاني');
export const contactLimiter = make(60 * 60 * 1000, 5, 'بعت رسائل كتير، حاول بعد ساعة');
