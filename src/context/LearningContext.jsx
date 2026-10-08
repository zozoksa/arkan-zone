import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as api from '@/services/api';

const LearningContext = createContext(null);
const EMPTY = { enrollments: {}, activity: [], favorites: [], certificates: {} };

/**
 * Server-backed learning state for the signed-in user: enrollments, lesson
 * progress, favorites, certificates and recent activity (GET /me/learning).
 */
export function LearningProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(Boolean(user));

  const refresh = useCallback(async () => {
    if (!user) {
      setState(EMPTY);
      setLoading(false);
      return EMPTY;
    }
    const next = await api.getLearningState();
    setState(next);
    setLoading(false);
    return next;
  }, [user]);

  useEffect(() => {
    setLoading(Boolean(user));
    refresh().catch(() => setLoading(false));
  }, [refresh, user]);

  const isEnrolled = useCallback((courseId) => Boolean(state.enrollments[courseId]), [state.enrollments]);
  const isFavorite = useCallback((courseId) => state.favorites.includes(courseId), [state.favorites]);

  /** Free courses only; paid courses go through /checkout. */
  const enroll = useCallback(
    async (course) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      await api.enrollCourse(course.id);
      api.invalidateCourses();
      await refresh();
    },
    [user, refresh],
  );

  const openLesson = useCallback(
    (courseId, lessonId) => {
      setState((prev) =>
        prev.enrollments[courseId]
          ? {
              ...prev,
              enrollments: {
                ...prev.enrollments,
                [courseId]: { ...prev.enrollments[courseId], lastLessonId: lessonId, lastAccessedAt: new Date().toISOString() },
              },
            }
          : prev,
      );
      api.openLesson(courseId, lessonId).catch(() => {});
    },
    [],
  );

  /** Optimistic update, then sync with the server (which may issue a certificate). */
  const completeLesson = useCallback(
    async (course, lesson) => {
      setState((prev) => {
        const current = prev.enrollments[course.id];
        if (!current || current.completedLessons.includes(lesson.id)) return prev;
        return {
          ...prev,
          enrollments: {
            ...prev.enrollments,
            [course.id]: { ...current, completedLessons: [...current.completedLessons, lesson.id], lastLessonId: lesson.id },
          },
        };
      });
      try {
        const result = await api.completeLesson(course.id, lesson.id);
        await refresh();
        return result;
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (courseId) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      const adding = !state.favorites.includes(courseId);
      setState((prev) => ({
        ...prev,
        favorites: adding ? [courseId, ...prev.favorites] : prev.favorites.filter((id) => id !== courseId),
      }));
      try {
        await (adding ? api.addFavorite(courseId) : api.removeFavorite(courseId));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          favorites: adding ? prev.favorites.filter((id) => id !== courseId) : [courseId, ...prev.favorites],
        }));
        throw error;
      }
      return adding;
    },
    [user, state.favorites],
  );

  const value = useMemo(
    () => ({
      ...state,
      loading,
      refresh,
      isEnrolled,
      enroll,
      openLesson,
      completeLesson,
      isFavorite,
      toggleFavorite,
    }),
    [state, loading, refresh, isEnrolled, enroll, openLesson, completeLesson, isFavorite, toggleFavorite],
  );
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside LearningProvider');
  return ctx;
}
