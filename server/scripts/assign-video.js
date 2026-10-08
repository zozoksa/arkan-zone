/**
 * Link a Bunny Stream video to a lesson.
 *   npm run video:assign -- <lessonId> <bunnyVideoId>
 *   npm run video:assign -- 3-l5 ""     (unlink)
 */
import { db } from '../config/db.js';
import { prepareDatabase } from '../db/index.js';

const [lessonId, videoId] = process.argv.slice(2);
if (!lessonId) {
  console.error('Usage: npm run video:assign -- <lessonId> <bunnyVideoId>');
  process.exit(1);
}
await prepareDatabase({ log: false });
const updated = await db('lessons').where({ id: lessonId }).update({ video_id: videoId || null });
console.log(updated ? `Lesson ${lessonId} → ${videoId || '(no video)'}` : `Lesson ${lessonId} not found`);
await db.destroy();
