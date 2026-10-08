import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import EnrolledCourseCard from '@/components/dashboard/EnrolledCourseCard';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { CourseGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { useMyCourses } from '@/hooks/useMyCourses';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/utils/cn';

const tabs = [
  { id: 'all', label: 'الكل' },
  { id: 'progress', label: 'قيد التعلم' },
  { id: 'done', label: 'مكتملة' },
];

export default function MyCourses() {
  usePageMeta('كورساتي');
  const { items, certificates, loading, error, reload } = useMyCourses();
  const [tab, setTab] = useState('all');

  const shown = items.filter((i) => (tab === 'all' ? true : tab === 'done' ? i.progress === 100 : i.progress < 100));

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">كورساتي</h1>
          <p className="mt-2 text-muted">كل الكورسات اللي اشتركت فيها وتقدمك في كل واحد.</p>
        </div>
        {items.length > 0 && (
          <div role="tablist" aria-label="تصفية الكورسات" className="flex rounded-xl bg-sunken p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition', tab === t.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <CourseGridSkeleton count={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="مفيش كورسات هنا لسه"
            description="أول ما تشترك في كورس هيظهر هنا مع نسبة تقدمك."
            action={<Button to="/courses">استكشف الكورسات</Button>}
          />
        ) : shown.length === 0 ? (
          <EmptyState
            title={tab === 'done' ? 'لسه مكملتش أي كورس' : 'كل كورساتك مكتملة'}
            description={tab === 'done' ? 'كمّل الدروس الباقية وهتلاقي كورساتك المكتملة هنا.' : 'برافو! جرّب كورس جديد.'}
            action={
              <Button variant="secondary" onClick={() => setTab('all')}>
                عرض الكل
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((item) => (
              <EnrolledCourseCard key={item.course.id} item={item} certificate={certificates[item.course.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
