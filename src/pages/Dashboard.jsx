import { BookOpen, Clock3, Flame, Trophy, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/dashboard/StatCard';
import EnrolledCourseCard from '@/components/dashboard/EnrolledCourseCard';
import ActivityList from '@/components/dashboard/ActivityList';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import ErrorState from '@/components/common/ErrorState';
import CourseGrid from '@/components/courses/CourseGrid';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useMyCourses } from '@/hooks/useMyCourses';
import { usePageMeta } from '@/hooks/usePageMeta';
import { learningStreak } from '@/utils/progress';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'نهارك سعيد';
  return 'مساء الخير';
}

export default function Dashboard() {
  usePageMeta('لوحة التحكم');
  const { user } = useAuth();
  const { items, activity, courses, categoryMap, loading, error, reload } = useMyCourses();

  if (loading) {
    return (
      <div className="container-page py-10">
        <DashboardSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const completed = items.filter((i) => i.progress === 100).length;
  const hours = items.reduce((s, i) => s + i.minutes, 0) / 60;
  const streak = learningStreak(activity);
  const current = items.find((i) => i.progress < 100);
  const recommended = courses.filter((c) => !items.some((i) => i.course.id === c.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="container-page py-10 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted">{greeting()}</p>
          <h1 className="mt-1 text-3xl font-bold">أهلًا، {user.name.split(' ')[0]}</h1>
        </div>
        <Button to="/courses" variant="secondary">
          تصفح كورسات جديدة
        </Button>
      </header>

      <section aria-label="إحصائيات التعلم" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="كورسات مشترك فيها" value={items.length} />
        <StatCard icon={Trophy} label="كورسات مكتملة" value={completed} />
        <StatCard icon={Clock3} label="ساعات التعلم" value={hours.toFixed(1)} hint="من الدروس المكتملة" />
        <StatCard icon={Flame} label="أيام متتالية" value={streak} hint={streak ? 'كمّل كده!' : 'ابدأ درس النهارده'} />
      </section>

      {items.length === 0 ? (
        <div className="mt-10 space-y-12">
          <EmptyState
            icon={BookOpen}
            title="لسه مشتركتش في أي كورس"
            description="اختار أول كورس ليك، وتقدمك هيظهر هنا."
            action={<Button to="/courses">استكشف الكورسات</Button>}
          />
          <section>
            <h2 className="mb-6 text-xl font-bold">مقترحة ليك</h2>
            <CourseGrid courses={recommended} categoryMap={categoryMap} />
          </section>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-10">
            {current && (
              <section aria-labelledby="continue-title">
                <h2 id="continue-title" className="mb-4 text-xl font-bold">
                  كمّل من مكان ما وقفت
                </h2>
                <div className="grid overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-[260px_1fr]">
                  <Link to={`/learn/${current.course.id}`} className="relative block aspect-video sm:aspect-auto" tabIndex={-1}>
                    <CourseThumbnail thumbnail={current.course.thumbnail} title={current.course.title} />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid size-14 place-items-center rounded-full bg-white/90 text-[#0f2a23] shadow-lg">
                        <Play className="size-5 fill-current" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                  <div className="p-6">
                    <p className="text-sm text-muted">{current.course.instructor.name}</p>
                    <h3 className="mt-1 text-lg font-medium">{current.course.title}</h3>
                    <p className="mt-3 text-sm text-ink-soft">
                      الدرس الجاي: <span className="font-medium text-ink">{current.next?.title}</span>
                    </p>
                    <ProgressBar value={current.progress} className="mt-4" />
                    <Button to={`/learn/${current.course.id}`} className="mt-5">
                      استكمل التعلّم
                    </Button>
                  </div>
                </div>
              </section>
            )}

            <section aria-labelledby="mine-title">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="mine-title" className="text-xl font-bold">
                  كورساتي
                </h2>
                <Link to="/my-courses" className="text-sm font-medium text-primary hover:underline">
                  عرض الكل
                </Link>
              </div>
              <div className="space-y-3">
                {items.slice(0, 4).map((item) => (
                  <EnrolledCourseCard key={item.course.id} item={item} layout="row" />
                ))}
              </div>
            </section>
          </div>

          <aside aria-labelledby="activity-title" className="h-fit rounded-2xl border border-line bg-surface p-5">
            <h2 id="activity-title" className="mb-3 text-lg font-bold">
              آخر نشاط
            </h2>
            <ActivityList activity={activity} />
          </aside>
        </div>
      )}
    </div>
  );
}
