import { z } from 'zod';

const name = z.string({ error: 'اكتب الاسم' }).trim().min(2, 'الاسم لازم يكون حرفين على الأقل').max(120, 'الاسم طويل جدًا');
const email = z.string({ error: 'اكتب البريد الإلكتروني' }).trim().toLowerCase().pipe(z.email('البريد الإلكتروني غير صحيح')).pipe(z.string().max(190));
const password = z.string({ error: 'اكتب كلمة المرور' }).min(6, 'كلمة المرور لازم تكون 6 حروف على الأقل').max(128, 'كلمة المرور طويلة جدًا');

export const schemas = {
  register: z.object({ name, email, password }),
  login: z.object({ email, password: z.string({ error: 'اكتب كلمة المرور' }).min(1, 'اكتب كلمة المرور') }),
  forgot: z.object({ email }),
  reset: z.object({ token: z.string().min(10, 'الرابط غير صالح'), password }),
  verify: z.object({ token: z.string().min(10, 'الرابط غير صالح') }),
  changePassword: z.object({ currentPassword: z.string().min(1, 'اكتب كلمة المرور الحالية'), newPassword: password }),
  profile: z.object({ name: name.optional(), email: email.optional(), bio: z.string().max(280, 'النبذة أطول من 280 حرف').optional() }),
  lesson: z.object({ courseId: z.string().min(1), lessonId: z.string().min(1) }),
  enroll: z.object({ courseId: z.coerce.string().min(1, 'courseId مطلوب') }),
  checkout: z.object({ courseId: z.coerce.string().min(1), coupon: z.string().trim().max(40).optional().or(z.literal('')) }),
  mockPay: z.object({ success: z.boolean().default(true) }),
  review: z.object({
    rating: z.coerce.number().int().min(1, 'اختار تقييم من 1 لـ 5').max(5, 'اختار تقييم من 1 لـ 5'),
    comment: z.string().trim().min(5, 'اكتب رأيك في 5 حروف على الأقل').max(1000, 'التعليق طويل جدًا'),
  }),
  contact: z.object({ name, email, message: z.string().trim().min(10, 'الرسالة لازم تكون 10 حروف على الأقل').max(4000) }),
  role: z.object({ role: z.enum(['student', 'admin'], { error: 'صلاحية غير صالحة' }) }),
  handled: z.object({ handled: z.boolean() }),
  coupon: z.object({
    code: z.string().trim().min(3, 'الكود 3 حروف على الأقل').max(40).regex(/^[A-Za-z0-9_-]+$/, 'حروف إنجليزي وأرقام بس'),
    percent: z.coerce.number().int().min(1, 'من 1 لـ 100').max(100, 'من 1 لـ 100'),
    maxUses: z.coerce.number().int().min(1).optional().nullable(),
    expiresAt: z.string().optional().nullable(),
  }),
  couponUpdate: z.object({ active: z.boolean() }),
};
