/** Learning-progress helpers shared by dashboard, my courses and the player. */

export function allLessons(course) {
  return course?.curriculum?.flatMap((s) => s.lessons) ?? [];
}

export function courseProgress(course, enrollment) {
  const total = course?.lessons || 0;
  const done = enrollment?.completedLessons?.length || 0;
  return total ? Math.round((done / total) * 100) : 0;
}

export function nextLesson(course, enrollment) {
  const done = new Set(enrollment?.completedLessons || []);
  return allLessons(course).find((l) => !done.has(l.id)) || allLessons(course)[0];
}

export function completedMinutes(course, enrollment) {
  const done = new Set(enrollment?.completedLessons || []);
  return allLessons(course)
    .filter((l) => done.has(l.id))
    .reduce((sum, l) => sum + l.minutes, 0);
}

/** Consecutive days (ending today or yesterday) with at least one activity. */
export function learningStreak(activity = []) {
  const days = new Set(activity.map((a) => new Date(a.at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
