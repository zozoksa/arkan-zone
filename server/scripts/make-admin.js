/** Promote an existing account:  npm run make-admin -- someone@example.com */
import { db } from '../config/db.js';
import { prepareDatabase } from '../db/index.js';

const email = (process.argv[2] || '').toLowerCase();
if (!email) {
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}
await prepareDatabase({ log: false });
const updated = await db('users').where({ email }).update({ role: 'admin' });
console.log(updated ? `${email} is now an admin` : `No user with email ${email}`);
await db.destroy();
