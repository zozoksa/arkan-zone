import { db } from '../config/db.js';
import { HttpError } from '../utils/HttpError.js';
import { parseJson, toBool } from '../utils/helpers.js';

export const LEVELS = [
  { id: 'beginner', name: 'مبتدئ' },
  { id: 'intermediate', name: 'متوسط' },
  { id: 'advanced', name: 'متقدم' },
];

const SORTS = {
  popular: [['students', 'desc']],
  rating: [['rating', 'desc'], ['rating_count', 'desc']],
  newest: [['created_at', 'desc']],
  'price-asc': [['price', 'asc']],
  'price-desc': [['price', 'desc']],
};

/** Maps DB rows to the public course shape used by the frontend. Video ids are never exposed. */
function toCourse(row, sections = [], lessons = [], reviews) {
  const curriculum = sections
    .filter((s) => s.course_id === row.id)
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      id: s.id,
      title: s.title,
      lessons: lessons
        .filter((l) => l.section_id === s.id)
        .sort((a, b) => a.position - b.position)
        .map((l) => ({ id: l.id, title: l.title, minutes: l.minutes, type: l.type, preview: toBool(l.preview), hasVideo: Boolean(l.video_id) })),
    }));
  const all = curriculum.flatMap((s) => s.lessons);
  const durationMinutes = all.reduce((sum, l) => sum + l.minutes, 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category_id,
    level: row.level,
    price: row.price,
    oldPrice: row.old_price,
    rating: Math.round(Number(row.rating) * 10) / 10,
    ratingCount: row.rating_count,
    students: row.students,
    createdAt: row.created_at,
    instructor: { name: row.instructor_name, title: row.instructor_title },
    instructorBio: row.instructor_bio,
    thumbnail: parseJson(row.thumbnail, {}),
    featured: toBool(row.featured),
    isNew: toBool(row.is_new),
    bestSeller: toBool(row.best_seller),
    skills: parseJson(row.skills),
    requirements: parseJson(row.requirements),
    whatYouWillLearn: parseJson(row.outcomes),
    curriculum,
    lessons: all.length,
    durationMinutes,
    duration: Math.max(1, Math.round(durationMinutes / 60)),
    ...(reviews
      ? {
          reviews: reviews.map((r) => ({
            id: String(r.id),
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            date: r.created_at,
            userId: r.user_id || null,
          })),
        }
      : {}),
  };
}

async function hydrate(rows, { withReviews = false } = {}) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [sections, lessons] = await Promise.all([
    db('sections').whereIn('course_id', ids),
    db('lessons').whereIn('course_id', ids),
  ]);
  let reviewsByCourse = {};
  if (withReviews) {
    const reviews = await db('reviews').whereIn('course_id', ids).orderBy('created_at', 'desc');
    reviewsByCourse = reviews.reduce((acc, r) => ((acc[r.course_id] ||= []).push(r), acc), {});
  }
  return rows.map((row) => toCourse(row, sections, lessons, withReviews ? (reviewsByCourse[row.id] || []).slice(0, 8) : undefined));
}

export async function listCourses({ search, category, level, featured, sort } = {}) {
  const q = db('courses').where({ published: true });
  if (category) q.andWhere({ category_id: category });
  if (level) q.andWhere({ level });
  if (featured === 'true') q.andWhere({ featured: true });
  if (search) {
    const term = `%${String(search).trim().toLowerCase()}%`;
    q.andWhere((w) =>
      w.whereRaw('lower(title) like ?', [term])
        .orWhereRaw('lower(short_description) like ?', [term])
        .orWhereRaw('lower(instructor_name) like ?', [term])
        .orWhereRaw('lower(skills) like ?', [term]),
    );
  }
  for (const [col, dir] of SORTS[sort] || SORTS.popular) q.orderBy(col, dir);
  return hydrate(await q);
}

export async function findCourseRow(idOrSlug) {
  return db('courses').where({ published: true }).andWhere((w) => w.where({ id: idOrSlug }).orWhere({ slug: idOrSlug })).first();
}

export async function getCourse(idOrSlug) {
  const row = await findCourseRow(idOrSlug);
  if (!row) throw new HttpError(404, 'الكورس ده مش موجود');
  const [course] = await hydrate([row], { withReviews: true });
  return course;
}

export async function getCoursesByIds(ids) {
  if (!ids.length) return [];
  return hydrate(await db('courses').whereIn('id', ids));
}

export async function relatedCourses(idOrSlug, limit = 4) {
  const row = await findCourseRow(idOrSlug);
  if (!row) throw new HttpError(404, 'الكورس ده مش موجود');
  const same = await db('courses').where({ published: true, category_id: row.category_id }).whereNot({ id: row.id }).orderBy('students', 'desc');
  const others = await db('courses').where({ published: true }).whereNot({ category_id: row.category_id }).orderBy('students', 'desc');
  return hydrate([...same, ...others].slice(0, limit));
}

export async function listCategories() {
  const rows = await db('categories').orderBy('position');
  const counts = await db('courses').where({ published: true }).select('category_id').count({ count: '*' }).groupBy('category_id');
  const map = Object.fromEntries(counts.map((c) => [c.category_id, Number(c.count)]));
  return rows.map((c) => ({ id: c.id, name: c.name, icon: c.icon, description: c.description, courseCount: map[c.id] || 0 }));
}

export async function addReview(user, courseId, { rating, comment }) {
  const course = await findCourseRow(courseId);
  if (!course) throw new HttpError(404, 'الكورس ده مش موجود');
  const enrolled = await db('enrollments').where({ user_id: user.id, course_id: course.id }).first();
  if (!enrolled) throw new HttpError(403, 'لازم تكون مشترك في الكورس عشان تقيّمه');
  const existing = await db('reviews').where({ user_id: user.id, course_id: course.id }).first();
  if (existing) throw new HttpError(409, 'أنت قيّمت الكورس ده قبل كده');

  const createdAt = new Date().toISOString();
  await db.transaction(async (trx) => {
    await trx('reviews').insert({ course_id: course.id, user_id: user.id, name: user.name, rating, comment, created_at: createdAt });
    const count = course.rating_count + 1;
    const avg = (Number(course.rating) * course.rating_count + rating) / count;
    await trx('courses').where({ id: course.id }).update({ rating: Math.round(avg * 100) / 100, rating_count: count });
  });
  return { name: user.name, rating, comment, date: createdAt, userId: user.id };
}
