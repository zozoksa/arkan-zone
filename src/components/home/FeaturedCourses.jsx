import SectionHeader from '@/components/common/SectionHeader';
import ErrorState from '@/components/common/ErrorState';
import CourseGrid from '@/components/courses/CourseGrid';
import Button from '@/components/ui/Button';
import { CourseCardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function FeaturedCourses({ courses, categoryMap, loading, error, onRetry }) {
  const featured = courses.filter((c) => c.featured).slice(0, 6);
  return (
    <section className="bg-surface py-16 lg:py-24" aria-labelledby="featured-title">
      <div className="container-page">
        <SectionHeader
          id="featured-title"
          title="الكورسات المميزة"
          description="اختارناها لك على أساس التقييمات ونتايج الطلاب الفعلية."
          action={
            <Button to="/courses" variant="secondary" size="sm">
              كل الكورسات
            </Button>
          }
        />
        {error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <CourseGrid courses={featured} categoryMap={categoryMap} columns={3} />
        )}
      </div>
    </section>
  );
}
