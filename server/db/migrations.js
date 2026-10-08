/**
 * Schema migrations. Written with portable Knex types so the same code runs on
 * SQLite (dev), PostgreSQL and MySQL. Timestamps are ISO-8601 strings and JSON
 * fields are stored as text, which keeps behaviour identical across databases.
 * Add new migrations to the end of the list; never edit an applied one.
 */
const init = {
  async up(knex) {
    await knex.schema.createTable('users', (t) => {
      t.string('id', 36).primary();
      t.string('name', 120).notNullable();
      t.string('email', 190).notNullable().unique();
      t.string('password_hash').notNullable();
      t.string('role', 20).notNullable().defaultTo('student');
      t.text('bio');
      t.string('avatar_url');
      t.string('email_verified_at', 30);
      t.string('created_at', 30).notNullable();
      t.string('updated_at', 30);
    });

    await knex.schema.createTable('auth_tokens', (t) => {
      t.increments('id');
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('type', 20).notNullable();
      t.string('token_hash', 64).notNullable().index();
      t.string('expires_at', 30).notNullable();
      t.string('used_at', 30);
      t.string('created_at', 30).notNullable();
    });

    await knex.schema.createTable('categories', (t) => {
      t.string('id', 40).primary();
      t.string('name', 80).notNullable();
      t.string('icon', 40);
      t.text('description');
      t.integer('position').defaultTo(0);
    });

    await knex.schema.createTable('courses', (t) => {
      t.string('id', 36).primary();
      t.string('slug', 120).notNullable().unique();
      t.string('title', 200).notNullable();
      t.text('short_description');
      t.text('description');
      t.string('category_id', 40).references('categories.id');
      t.string('level', 20).notNullable();
      t.integer('price').notNullable().defaultTo(0);
      t.integer('old_price');
      t.float('rating').defaultTo(0);
      t.integer('rating_count').defaultTo(0);
      t.integer('students').defaultTo(0);
      t.string('instructor_name', 120);
      t.string('instructor_title', 120);
      t.text('instructor_bio');
      t.text('thumbnail');
      t.boolean('featured').defaultTo(false);
      t.boolean('is_new').defaultTo(false);
      t.boolean('best_seller').defaultTo(false);
      t.text('skills');
      t.text('requirements');
      t.text('outcomes');
      t.boolean('published').defaultTo(true);
      t.string('created_at', 30).notNullable();
    });

    await knex.schema.createTable('sections', (t) => {
      t.string('id', 60).primary();
      t.string('course_id', 36).notNullable().references('courses.id').onDelete('CASCADE');
      t.string('title', 200).notNullable();
      t.integer('position').notNullable();
    });

    await knex.schema.createTable('lessons', (t) => {
      t.string('id', 60).primary();
      t.string('course_id', 36).notNullable().references('courses.id').onDelete('CASCADE');
      t.string('section_id', 60).notNullable().references('sections.id').onDelete('CASCADE');
      t.string('title', 200).notNullable();
      t.integer('minutes').notNullable();
      t.string('type', 20).notNullable().defaultTo('video');
      t.boolean('preview').defaultTo(false);
      t.integer('position').notNullable();
      t.string('video_id', 80);
    });

    await knex.schema.createTable('enrollments', (t) => {
      t.increments('id');
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('course_id', 36).notNullable().references('courses.id').onDelete('CASCADE');
      t.string('order_id', 36);
      t.string('enrolled_at', 30).notNullable();
      t.string('last_lesson_id', 60);
      t.string('last_accessed_at', 30);
      t.string('completed_at', 30);
      t.unique(['user_id', 'course_id']);
    });

    await knex.schema.createTable('lesson_progress', (t) => {
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('lesson_id', 60).notNullable().references('lessons.id').onDelete('CASCADE');
      t.string('course_id', 36).notNullable();
      t.string('completed_at', 30).notNullable();
      t.primary(['user_id', 'lesson_id']);
    });

    await knex.schema.createTable('favorites', (t) => {
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('course_id', 36).notNullable().references('courses.id').onDelete('CASCADE');
      t.string('created_at', 30).notNullable();
      t.primary(['user_id', 'course_id']);
    });

    await knex.schema.createTable('reviews', (t) => {
      t.increments('id');
      t.string('course_id', 36).notNullable().references('courses.id').onDelete('CASCADE');
      t.string('user_id', 36).references('users.id').onDelete('SET NULL');
      t.string('name', 120).notNullable();
      t.integer('rating').notNullable();
      t.text('comment');
      t.string('created_at', 30).notNullable();
    });

    await knex.schema.createTable('coupons', (t) => {
      t.string('code', 40).primary();
      t.integer('percent').notNullable();
      t.integer('max_uses');
      t.integer('used_count').notNullable().defaultTo(0);
      t.string('expires_at', 30);
      t.boolean('active').defaultTo(true);
      t.string('created_at', 30).notNullable();
    });

    await knex.schema.createTable('orders', (t) => {
      t.string('id', 36).primary();
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('course_id', 36).notNullable().references('courses.id');
      t.integer('amount').notNullable();
      t.integer('original_amount').notNullable();
      t.integer('discount').notNullable().defaultTo(0);
      t.string('coupon_code', 40);
      t.string('currency', 3).notNullable().defaultTo('EGP');
      t.string('status', 20).notNullable().defaultTo('pending');
      t.string('provider', 20).notNullable();
      t.string('provider_ref', 120);
      t.string('created_at', 30).notNullable();
      t.string('paid_at', 30);
      t.index(['user_id']);
      t.index(['status']);
    });

    await knex.schema.createTable('certificates', (t) => {
      t.string('id', 20).primary();
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('course_id', 36).notNullable().references('courses.id');
      t.string('issued_at', 30).notNullable();
      t.unique(['user_id', 'course_id']);
    });

    await knex.schema.createTable('notifications', (t) => {
      t.increments('id');
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('type', 30).notNullable();
      t.string('title', 200).notNullable();
      t.text('body');
      t.string('link');
      t.string('read_at', 30);
      t.string('created_at', 30).notNullable();
      t.index(['user_id']);
    });

    await knex.schema.createTable('activity', (t) => {
      t.increments('id');
      t.string('user_id', 36).notNullable().references('users.id').onDelete('CASCADE');
      t.string('type', 20).notNullable();
      t.string('course_id', 36);
      t.string('lesson_id', 60);
      t.string('created_at', 30).notNullable();
      t.index(['user_id']);
    });

    await knex.schema.createTable('contact_messages', (t) => {
      t.increments('id');
      t.string('name', 120).notNullable();
      t.string('email', 190).notNullable();
      t.text('message').notNullable();
      t.boolean('handled').defaultTo(false);
      t.string('created_at', 30).notNullable();
    });
  },

  async down(knex) {
    for (const table of [
      'contact_messages', 'activity', 'notifications', 'certificates', 'orders', 'coupons', 'reviews',
      'favorites', 'lesson_progress', 'enrollments', 'lessons', 'sections', 'courses', 'categories',
      'auth_tokens', 'users',
    ]) {
      await knex.schema.dropTableIfExists(table);
    }
  },
};

const migrations = { '001_init': init };

/** Knex migration source that does not depend on file-system loading (works with ESM everywhere). */
export const migrationSource = {
  getMigrations: async () => Object.keys(migrations),
  getMigrationName: (name) => name,
  getMigration: async (name) => migrations[name],
};
