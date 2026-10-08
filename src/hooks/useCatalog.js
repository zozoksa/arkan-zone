import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { getCategories, getCourses } from '@/services/api';

/** Courses + categories with lookup maps. Courses are cached in services/api. */
export function useCatalog() {
  const courses = useAsync(() => getCourses(), []);
  const categories = useAsync(() => getCategories(), []);

  const categoryMap = useMemo(
    () => Object.fromEntries((categories.data || []).map((c) => [c.id, c])),
    [categories.data],
  );

  return {
    courses: courses.data || [],
    categories: categories.data || [],
    categoryMap,
    loading: courses.loading || categories.loading,
    error: courses.error || categories.error,
    reload: () => {
      courses.reload();
      categories.reload();
    },
  };
}
