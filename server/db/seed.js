import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { categories, courses } from '../data/courses.js';
import { env } from '../config/env.js';

const now = () => new Date().toISOString();
const json = (v) => JSON.stringify(v ?? []);

/** Seeds the catalogue once (when empty) and makes sure the admin/demo accounts exist. */
export async function seed(knex, { log = true } = {}) {
  const [{ count }] = await knex('categories').count({ count: '*' });
  if (Number(count) === 0) {
    await knex.transaction(async (trx) => {
      await trx('categories').insert(
        categories.map((c, i) => ({ id: c.id, name: c.name, icon: c.icon, description: c.description, position: i })),
      );
      for (const c of courses) {
        await trx('courses').insert({
          id: c.id,
          slug: c.slug,
          title: c.title,
          short_description: c.shortDescription,
          description: c.description,
          category_id: c.category,
          level: c.level,
          price: c.price,
          old_price: c.oldPrice,
          rating: c.rating,
          rating_count: c.ratingCount,
          students: c.students,
          instructor_name: c.instructor.name,
          instructor_title: c.instructor.title,
          instructor_bio: c.instructorBio,
          thumbnail: JSON.stringify(c.thumbnail),
          featured: c.featured,
          is_new: c.isNew,
          best_seller: c.bestSeller,
          skills: json(c.skills),
          requirements: json(c.requirements),
          outcomes: json(c.whatYouWillLearn),
          published: true,
          created_at: new Date(c.createdAt).toISOString(),
        });
        let lessonPos = 0;
        for (const [sIndex, section] of c.curriculum.entries()) {
          await trx('sections').insert({ id: section.id, course_id: c.id, title: section.title, position: sIndex });
          for (const l of section.lessons) {
            await trx('lessons').insert({
              id: l.id, course_id: c.id, section_id: section.id, title: l.title,
              minutes: l.minutes, type: l.type, preview: l.preview, position: lessonPos++,
            });
          }
        }
        for (const r of c.reviews) {
          await trx('reviews').insert({
            course_id: c.id, name: r.name, rating: r.rating, comment: r.comment, created_at: new Date(r.date).toISOString(),
          });
        }
      }
      await trx('coupons').insert({ code: 'WELCOME20', percent: 20, max_uses: 500, used_count: 0, active: true, created_at: now() });
    });
    if (log) console.log(`[seed] Inserted ${categories.length} categories and ${courses.length} courses.`);
  }

  await ensureUser(knex, { ...env.admin, role: 'admin' }, log);
  if (env.seedDemo) await ensureUser(knex, { name: 'طالب تجريبي', email: 'demo@arkanzone.com', password: '123456', role: 'student' }, log);
}

async function ensureUser(knex, { name, email, password, role }, log) {
  if (!email || !password) return;
  const existing = await knex('users').where({ email: email.toLowerCase() }).first();
  if (existing) return;
  await knex('users').insert({
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    password_hash: await bcrypt.hash(password, 10),
    role,
    bio: '',
    email_verified_at: now(),
    created_at: now(),
  });
  if (log) console.log(`[seed] Created ${role} account ${email}`);
}
