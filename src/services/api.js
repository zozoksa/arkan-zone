/**
 * Single entry point for every network call in the app.
 * Components never call fetch() directly — they use these functions.
 */
import { storage, STORAGE_KEYS } from './storage';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_ORIGIN = API_URL.replace(/\/api$/, '');
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status = 0, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/* Lets AuthContext react to an expired/invalid session anywhere in the app. */
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { Accept: 'application/json' };
  const token = storage.get(STORAGE_KEYS.token);
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      error.name === 'AbortError' ? 'السيرفر اتأخر في الرد، حاول تاني' : 'مقدرناش نوصل للسيرفر. اتأكد إن الـ API شغال واتصالك سليم',
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(json?.message || 'حدث خطأ غير متوقع', res.status, json?.details);
  }
  return json?.meta ? { data: json.data, meta: json.meta } : json?.data;
}

const enc = encodeURIComponent;
const qs = (params = {}) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null));
  return p.toString() ? `?${p}` : '';
};

/** Turns "/uploads/..." paths returned by the API into absolute URLs. */
export const assetUrl = (path) => (path && path.startsWith('/') ? `${API_ORIGIN}${path}` : path);

/* ---------- Catalogue ---------- */
let coursesCache = null;
export function getCourses({ force = false } = {}) {
  if (!coursesCache || force) {
    coursesCache = request('/courses', { auth: false })
      .then((r) => r.data)
      .catch((e) => {
        coursesCache = null;
        throw e;
      });
  }
  return coursesCache;
}
export const invalidateCourses = () => {
  coursesCache = null;
};
export const getCourse = (id) => request(`/courses/${enc(id)}`, { auth: false });
export const getRelatedCourses = (id, limit = 4) => request(`/courses/${enc(id)}/related${qs({ limit })}`, { auth: false });
export const getCategories = () => request('/categories', { auth: false });
export const getLessonPlayback = (courseId, lessonId) => request(`/courses/${enc(courseId)}/lessons/${enc(lessonId)}/playback`);
export const addReview = (courseId, payload) => request(`/courses/${enc(courseId)}/reviews`, { method: 'POST', body: payload });
export const getCertificate = (code) => request(`/certificates/${enc(code)}`, { auth: false });
export const sendContact = (payload) => request('/contact', { method: 'POST', body: payload, auth: false });

/* ---------- Auth ---------- */
export const login = (credentials) => request('/auth/login', { method: 'POST', body: credentials, auth: false });
export const register = (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false });
export const getMe = () => request('/auth/me');
export const forgotPassword = (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
export const resetPassword = (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false });
export const verifyEmail = (token) => request('/auth/verify-email', { method: 'POST', body: { token }, auth: false });
export const resendVerification = () => request('/auth/resend-verification', { method: 'POST' });

/* ---------- Current user ---------- */
export const updateProfile = (data) => request('/me', { method: 'PATCH', body: data });
export const changePassword = (currentPassword, newPassword) =>
  request('/me/password', { method: 'PATCH', body: { currentPassword, newPassword } });
export function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return request('/me/avatar', { method: 'POST', form });
}
export const getLearningState = () => request('/me/learning');
export const openLesson = (courseId, lessonId) => request('/me/lessons/open', { method: 'POST', body: { courseId, lessonId } });
export const completeLesson = (courseId, lessonId) => request('/me/lessons/complete', { method: 'POST', body: { courseId, lessonId } });
export const addFavorite = (courseId) => request(`/me/favorites/${enc(courseId)}`, { method: 'PUT' });
export const removeFavorite = (courseId) => request(`/me/favorites/${enc(courseId)}`, { method: 'DELETE' });
export const getMyOrders = () => request('/me/orders');
export const getNotifications = () => request('/me/notifications');
export const markAllNotificationsRead = () => request('/me/notifications/read-all', { method: 'POST' });
export const markNotificationRead = (id) => request(`/me/notifications/${id}/read`, { method: 'PATCH' });
export const getUserCourses = (userId) => request(`/users/${enc(userId)}/courses`);

/* ---------- Enrollment & payments ---------- */
export const enrollCourse = (courseId) => request('/enroll', { method: 'POST', body: { courseId } });
export const getCheckoutQuote = (courseId, coupon) => request(`/checkout/quote${qs({ courseId, coupon })}`, { auth: false });
export const startCheckout = (courseId, coupon) => request('/checkout', { method: 'POST', body: { courseId, coupon } });
export const getOrder = (id) => request(`/orders/${enc(id)}`);
export const confirmOrder = (id, params) => request(`/orders/${enc(id)}/confirm`, { method: 'POST', body: { params } });
export const mockPay = (id, success) => request(`/orders/${enc(id)}/mock-pay`, { method: 'POST', body: { success } });

/* ---------- Admin ---------- */
export const admin = {
  stats: () => request('/admin/stats'),
  users: (params) => request(`/admin/users${qs(params)}`),
  setRole: (id, role) => request(`/admin/users/${enc(id)}/role`, { method: 'PATCH', body: { role } }),
  orders: (params) => request(`/admin/orders${qs(params)}`),
  messages: () => request('/admin/messages'),
  setHandled: (id, handled) => request(`/admin/messages/${id}`, { method: 'PATCH', body: { handled } }),
  coupons: () => request('/admin/coupons'),
  createCoupon: (payload) => request('/admin/coupons', { method: 'POST', body: payload }),
  setCouponActive: (code, active) => request(`/admin/coupons/${enc(code)}`, { method: 'PATCH', body: { active } }),
  deleteCoupon: (code) => request(`/admin/coupons/${enc(code)}`, { method: 'DELETE' }),
};
