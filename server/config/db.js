import knex from 'knex';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env.js';

/**
 * One Knex instance for the whole API.
 * - Development default: SQLite file (zero setup).
 * - Production: set DB_CLIENT=pg (or mysql2) and DATABASE_URL.
 */
function buildConfig() {
  const { client, url, filename } = env.db;
  if (client === 'better-sqlite3') {
    if (filename !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
    return {
      client,
      connection: { filename },
      useNullAsDefault: true,
      pool: { afterCreate: (conn, done) => { conn.pragma('foreign_keys = ON'); conn.pragma('journal_mode = WAL'); done(); } },
    };
  }
  return { client, connection: url, pool: { min: 0, max: 10 } };
}

export const db = knex(buildConfig());
export const isSqlite = env.db.client === 'better-sqlite3';
