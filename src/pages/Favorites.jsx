import { Heart } from 'lucide-react';
import CourseGrid from '@/components/courses/CourseGrid';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { CourseGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useLearning } from '@/context/LearningContext';

export default function Favorites() {
  usePageMeta('المفضلة');
  const { courses, categoryMap, loading, error, reload } = useCatalog();
  const { favorites, loading: learningLoading } = useLearning();
  const list = favorites.map((id) => courses.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="container-page py-10 sm:py-12">
      <h1 className="text-3xl font-bold">المفضلة</h1>
      <p className="mt-2 text-muted">الكورسات اللي حفظتها عشان ترجعلها بعدين.</p>
      <div className="mt-8">
        {loading || learningLoading ? (
          <CourseGridSkeleton count={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="مفيش كورسات في المفضلة"
            description="دوس على القلب في أي كورس عشان تحفظه هنا."
            action={<Button to="/courses">تصفح الكورسات</Button>}
          />
        ) : (
          <CourseGrid courses={list} categoryMap={categoryMap} />
        )}
      </div>
    </div>
  );
}
