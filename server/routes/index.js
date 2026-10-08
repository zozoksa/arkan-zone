import { Router } from 'express';
import * as course from '../controllers/courseController.js';
import * as auth from '../controllers/authController.js';
import * as me from '../controllers/meController.js';
import * as commerce from '../controllers/commerceController.js';
import * as admin from '../controllers/adminController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, contactLimiter } from '../middleware/rateLimit.js';
import { avatarUpload } from '../middleware/upload.js';
import { schemas } from '../utils/schemas.js';

const r = Router();

/* Catalogue (public) */
r.get('/courses', course.list);
r.get('/courses/:id', course.show);
r.get('/courses/:id/related', course.related);
r.get('/courses/:id/lessons/:lessonId/playback', optionalAuth, course.playback);
r.post('/courses/:id/reviews', requireAuth, validate(schemas.review), course.review);
r.get('/categories', course.categories);
r.get('/levels', course.levels);
r.get('/certificates/:code', commerce.certificate);
r.post('/contact', contactLimiter, validate(schemas.contact), commerce.contact);

/* Auth */
r.post('/auth/register', authLimiter, validate(schemas.register), auth.register);
r.post('/auth/login', authLimiter, validate(schemas.login), auth.login);
r.post('/auth/forgot-password', authLimiter, validate(schemas.forgot), auth.forgot);
r.post('/auth/reset-password', authLimiter, validate(schemas.reset), auth.reset);
r.post('/auth/verify-email', validate(schemas.verify), auth.verify);
r.post('/auth/resend-verification', requireAuth, authLimiter, auth.resend);
r.get('/auth/me', requireAuth, auth.me);

/* Current user */
r.patch('/me', requireAuth, validate(schemas.profile), me.updateProfile);
r.patch('/me/password', requireAuth, validate(schemas.changePassword), me.changePassword);
r.post('/me/avatar', requireAuth, avatarUpload, me.uploadAvatar);
r.get('/me/learning', requireAuth, me.learningState);
r.post('/me/lessons/open', requireAuth, validate(schemas.lesson), me.openLesson);
r.post('/me/lessons/complete', requireAuth, validate(schemas.lesson), me.completeLesson);
r.put('/me/favorites/:courseId', requireAuth, me.addFavorite);
r.delete('/me/favorites/:courseId', requireAuth, me.removeFavorite);
r.get('/me/orders', requireAuth, me.orders);
r.get('/me/notifications', requireAuth, me.listNotifications);
r.post('/me/notifications/read-all', requireAuth, me.readAllNotifications);
r.patch('/me/notifications/:id/read', requireAuth, me.readNotification);
r.get('/users/:id/courses', requireAuth, me.userCourses);

/* Enrollment & payments */
r.post('/enroll', requireAuth, validate(schemas.enroll), commerce.enroll);
r.get('/checkout/quote', validate(schemas.checkout, 'query'), commerce.quote);
r.post('/checkout', requireAuth, validate(schemas.checkout), commerce.start);
r.get('/orders/:id', requireAuth, commerce.order);
r.post('/orders/:id/confirm', requireAuth, commerce.confirmRedirect);
r.post('/orders/:id/mock-pay', requireAuth, validate(schemas.mockPay), commerce.mockPay);
r.post('/payments/paymob/webhook', commerce.paymobWebhook);

/* Admin */
const a = Router();
a.use(requireAuth, requireAdmin);
a.get('/stats', admin.stats);
a.get('/users', admin.users);
a.patch('/users/:id/role', validate(schemas.role), admin.setRole);
a.get('/orders', admin.orders);
a.get('/messages', admin.messages);
a.patch('/messages/:id', validate(schemas.handled), admin.setHandled);
a.get('/coupons', admin.coupons);
a.post('/coupons', validate(schemas.coupon), admin.createCoupon);
a.patch('/coupons/:code', validate(schemas.couponUpdate), admin.updateCoupon);
a.delete('/coupons/:code', admin.deleteCoupon);
r.use('/admin', a);

export default r;
