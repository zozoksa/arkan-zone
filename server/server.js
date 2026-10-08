import { env } from './config/env.js';
import { createApp } from './app.js';
import { prepareDatabase } from './db/index.js';
import { paymentMode } from './services/checkoutService.js';

await prepareDatabase();

createApp().listen(env.port, () => {
  console.log(`Arkan Zone API running on http://localhost:${env.port}/api`);
  console.log(`  database: ${env.db.client}${env.db.client === 'better-sqlite3' ? ` (${env.db.filename})` : ''}`);
  console.log(`  payments: ${paymentMode()}   email: ${env.mail.host ? 'smtp' : 'console (dev)'}   video: ${env.bunny.libraryId ? 'bunny' : 'not configured'}`);
});
