import { db } from '../config/db.js';
import { HttpError } from '../utils/HttpError.js';
import { certificateCode, nowIso } from '../utils/helpers.js';
import { findCourseRow } from './courseService.js';
import { logActivity, notify } from './notificationService.js';
import { emails } from './emailService.js';

/** Creates an enrollment (idempotent). Used by free enrolment and by paid orders. */
export async function enrollUser(userId, courseId, { orderId = null, trx = db } = {}) {
  const existing = await trx('enrollments').where({ user_id: userId, course_id: courseId }).first();
  if (existing) return { created: false };
  const now = nowIso();
  await trx('enrollments').insert({ user_id: userId, course_id: courseId, order_id: orderId, enrolled_at: now, last_accessed_at: now });
  await trx('courses').where({ id: courseId }).increment('students', 1);
  await logActivity(userId, { type: 'enroll', courseId }, trx);
  return { created: true };
}

export async function enrollFree(user, courseId) {
  const course = await findCourseRow(String(courseId));
  if (!course) throw new HttpError(404, 'الكورس غير موجود');
  if (course.price > 0) throw new HttpError(402, 'الكورس ده مدفوع، كمّل من صفحة الدفع');
  const result = await db.transaction((trx) => enrollUser(user.id, course.id, { trx }));
  if (result.created) {
    await notify(user.id, { type: 'enroll', title: `اشتركت في ${course.title}`, body: 'ابدأ أول درس دلوقتي.', link: `/learn/${course.id}` });
  }
  return { courseId: course.id, created: result.created };
}

/** Everything the frontend LearningContext needs in a single call. */
export async function learningState(userId) {
  const [enrollments, progress, favorites, certificates, activity] = await Promise.all([
    db('enrollments').where({ user_id: userId }),
    db('lesson_progress').where({ user_id: userId }),
    db('favorites').where({ user_id: userId }).orderBy('created_at', 'desc'),
    db('certificates').where({ user_id: userId }),
    db('activity as a')
      .leftJoin('courses as c', 'c.id', 'a.course_id')
      .leftJoin('lessons as l', 'l.id', 'a.lesson_id')
      .where('a.user_id', userId)
      .orderBy('a.id', 'desc')
      .limit(30)
      .select('a.id', 'a.type', 'a.course_id', 'a.created_at', 'c.title as course_title', 'l.title as lesson_title'),
  ]);

  const done = progress.reduce((acc, p) => ((acc[p.course_id] ||= []).push(p.lesson_id), acc), {});
  return {
    enrollments: Object.fromEntries(
      enrollments.map((e) => [
        e.course_id,
        {
          enrolledAt: e.enrolled_at,
          lastAccessedAt: e.last_accessed_at || e.enrolled_at,
          lastLessonId: e.last_lesson_id,
          completedAt: e.completed_at,
          completedLessons: done[e.course_id] || [],
        },
      ]),
    ),
    favorites: favorites.map((f) => f.course_id),
    certificates: Object.fromEntries(certificates.map((c) => [c.course_id, c.id])),
    activity: activity.map((a) => ({
      id: String(a.id),
      type: a.type,
      courseId: a.course_id,
      courseTitle: a.course_title,
      lessonTitle: a.lesson_title,
      at: a.created_at,
    })),
  };
}

async function requireEnrollment(userId, courseId) {
  const enrollment = await db('enrollments').where({ user_id: userId, course_id: courseId }).first();
  if (!enrollment) throw new HttpError(403, 'لازم تشترك في الكورس الأول');
  return enrollment;
}

async function requireLesson(courseId, lessonId) {
  const lesson = await db('lessons').where({ id: lessonId, course_id: courseId }).first();
  if (!lesson) throw new HttpError(404, 'الدرس غير موجود');
  return lesson;
}

export async function openLesson(user, { courseId, lessonId }) {
  await requireEnrollment(user.id, courseId);
  await requireLesson(courseId, lessonId);
  await db('enrollments').where({ user_id: user.id, course_id: courseId }).update({ last_lesson_id: lessonId, last_accessed_at: nowIso() });
}

/** Marks a lesson complete; issues a certificate when the whole course is done. */
export async function completeLesson(user, { courseId, lessonId }) {
  await requireEnrollment(user.id, courseId);
  await requireLesson(courseId, lessonId);

  let certificate = null;
  await db.transaction(async (trx) => {
    const already = await trx('lesson_progress').where({ user_id: user.id, lesson_id: lessonId }).first();
    if (already) return;
    const now = nowIso();
    await trx('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId, course_id: courseId, completed_at: now });
    await trx('enrollments').where({ user_id: user.id, course_id: courseId }).update({ last_lesson_id: lessonId, last_accessed_at: now });
    await logActivity(user.id, { type: 'lesson', courseId, lessonId }, trx);

    const [{ total }] = await trx('lessons').where({ course_id: courseId }).count({ total: '*' });
    const [{ completed }] = await trx('lesson_progress').where({ user_id: user.id, course_id: courseId }).count({ completed: '*' });
    if (Number(completed) >= Number(total)) {
      await trx('enrollments').where({ user_id: user.id, course_id: courseId }).update({ completed_at: now });
      await logActivity(user.id, { type: 'complete', courseId }, trx);
      const existing = await trx('certificates').where({ user_id: user.id, course_id: courseId }).first();
      certificate = existing?.id;
      if (!existing) {
        certificate = certificateCode();
        await trx('certificates').insert({ id: certificate, user_id: user.id, course_id: courseId, issued_at: now });
        const course = await trx('courses').where({ id: courseId }).first();
        await notify(user.id, { type: 'certificate', title: `مبروك! شهادة ${course.title} جاهزة`, link: `/certificates/${certificate}` }, trx);
        emails.certificate(user, course, certificate);
      }
    }
  });
  return { certificate };
}

export async function setFavorite(user, courseId, on) {
  const course = await findCourseRow(String(courseId));
  if (!course) throw new HttpError(404, 'الكورس غير موجود');
  if (on) {
    const exists = await db('favorites').where({ user_id: user.id, course_id: course.id }).first();
    if (!exists) await db('favorites').insert({ user_id: user.id, course_id: course.id, created_at: nowIso() });
  } else {
    await db('favorites').where({ user_id: user.id, course_id: course.id }).delete();
  }
}

export async function getCertificate(code) {
  const row = await db('certificates as cert')
    .join('users as u', 'u.id', 'cert.user_id')
    .join('courses as c', 'c.id', 'cert.course_id')
    .where('cert.id', String(code).toUpperCase())
    .select('cert.id', 'cert.issued_at', 'u.name as student_name', 'c.id as course_id', 'c.title as course_title', 'c.instructor_name')
    .first();
  if (!row) throw new HttpError(404, 'مفيش شهادة بالرقم ده');
  const [{ minutes }] = await db('lessons').where({ course_id: row.course_id }).sum({ minutes: 'minutes' });
  return {
    code: row.id,
    studentName: row.student_name,
    courseId: row.course_id,
    courseTitle: row.course_title,
    instructorName: row.instructor_name,
    issuedAt: row.issued_at,
    hours: Math.max(1, Math.round(Number(minutes) / 60)),
  };
}
