import { db } from '../config/db.js';
import { nowIso } from '../utils/helpers.js';
import { emails } from './emailService.js';

export async function submitContact({ name, email, message }) {
  const row = { name: name.trim(), email: email.trim().toLowerCase(), message: message.trim(), handled: false, created_at: nowIso() };
  await db('contact_messages').insert(row);
  emails.contact(row);
}
