import { db } from '../config/db.js';
import { migrationSource } from './migrations.js';
import { seed } from './seed.js';

export async function prepareDatabase({ log = true } = {}) {
  const [, applied] = await db.migrate.latest({ migrationSource });
  if (log && applied.length) console.log(`[db] Applied migrations: ${applied.join(', ')}`);
  await seed(db, { log });
}

export { db, migrationSource };
