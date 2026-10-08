import { useMemo } from 'react';
import { useCatalog } from './useCatalog';
import { useLearning } from '@/context/LearningContext';
import { completedMinutes, courseProgress, nextLesson } from '@/utils/progress';

/** Enrolled courses joined with progress, newest activity first. */
export function useMyCourses() {
  const catalog = useCatalog();
  const { enrollments, activity, certificates, loading: learningLoading } = useLearning();

  const items = useMemo(
    () =>
      catalog.courses
        .filter((c) => enrollments[c.id])
        .map((course) => {
          const enrollment = enrollments[course.id];
          return {
            course,
            enrollment,
            progress: courseProgress(course, enrollment),
            next: nextLesson(course, enrollment),
            minutes: completedMinutes(course, enrollment),
          };
        })
        .sort((a, b) => new Date(b.enrollment.lastAccessedAt) - new Date(a.enrollment.lastAccessedAt)),
    [catalog.courses, enrollments],
  );

  return { ...catalog, loading: catalog.loading || learningLoading, items, activity, certificates };
}
