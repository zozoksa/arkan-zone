import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, CircleDot, SearchX } from 'lucide-react';
import CourseHeader from '@/components/courses/CourseHeader';
import PurchaseCard from '@/components/courses/PurchaseCard';
import Curriculum from '@/components/courses/Curriculum';
import InstructorCard from '@/components/courses/InstructorCard';
import ReviewsSection from '@/components/courses/ReviewsSection';
import AuthPromptModal from '@/components/courses/AuthPromptModal';
import CourseGrid from '@/components/courses/CourseGrid';
import SectionHeader from '@/components/common/SectionHeader';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { CourseDetailsSkeleton, CourseGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { useLearning } from '@/context/LearningContext';
import { useToast } from '@/context/ToastContext';
import { getCourse, getRelatedCourses } from '@/services/api';
import { formatHours, formatLessons, formatPrice } from '@/utils/format';

function Section({ id, title, children, aside }) {
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-title`} className="text-xl font-bold sm:text-2xl">
          {title}
        </h2>
        {aside && <p className="text-sm text-muted">{aside}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments, certificates, enroll, loading: learningLoading } = useLearning();
  const toast = useToast();
  const { courses, categoryMap } = useCatalog();
  const [enrolling, setEnrolling] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const autoEnrolled = useRef(false);

  const { data: course, loading, error, reload } = useAsync(() => getCourse(id), [id]);
  const related = useAsync(() => getRelatedCourses(id, 4), [id]);

  usePageMeta(course?.title || (error?.status === 404 ? 'الكورس غير موجود' : 'تفاصيل الكورس'), course?.shortDescription);

  const enrollment = course ? enrollments[course.id] : null;
  const category = course ? categoryMap[course.category] : null;

  const instructorStats = useMemo(() => {
    if (!course) return null;
    const own = courses.filter((c) => c.instructor.name === course.instructor.name);
    const list = own.length ? own : [course];
    return {
      courses: list.length,
      students: list.reduce((s, c) => s + c.students, 0),
      rating: list.reduce((s, c) => s + c.rating, 0) / list.length,
    };
  }, [course, courses]);

  const handleEnroll = async () => {
    if (!user) {
      setAuthPrompt(true);
      return;
    }
    if (course.price > 0) {
      navigate(`/checkout/${course.id}`);
      return;
    }
    setEnrolling(true);
    try {
      await enroll(course);
      toast({ title: 'تم الاشتراك في الكورس بنجاح', description: 'تقدر تبدأ أول درس دلوقتي.' });
    } catch (e) {
      toast({ title: 'مقدرناش نكمل الاشتراك', description: e.message, variant: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  // Returning from login/register with an enroll intent → enroll automatically once.
  useEffect(() => {
    if (course && user && !learningLoading && location.state?.intent === 'enroll' && !enrollment && !autoEnrolled.current) {
      autoEnrolled.current = true;
      navigate(location.pathname, { replace: true, state: null });
      handleEnroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, user, learningLoading]);

  if (loading) return <CourseDetailsSkeleton />;

  if (error) {
    return (
      <div className="container-page py-20">
        {error.status === 404 ? (
          <EmptyState
            icon={SearchX}
            title="الكورس ده مش موجود"
            description="ممكن يكون الرابط غلط أو الكورس اتشال. شوف الكورسات المتاحة."
            action={<Button to="/courses">تصفح الكورسات</Button>}
          />
        ) : (
          <ErrorState error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  return (
    <>
      {/* One grid for header + content so the purchase card can sit beside the header band on desktop.
          The band background bleeds full-width via a pseudo-element; overflow-x-clip prevents scrollbars. */}
      <div className="overflow-x-clip">
        <div className="container-page grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-14">
          <div className="min-w-0">
            <div className="relative isolate py-8 before:absolute before:inset-y-0 before:-inset-x-[100vw] before:-z-10 before:border-b before:border-line before:bg-surface sm:py-12">
              <CourseHeader course={course} category={category} />
            </div>
            <div className="pt-8 lg:hidden">
              <PurchaseCard course={course} enrolled={Boolean(enrollment)} enrolling={enrolling} onEnroll={handleEnroll} certificate={certificates[course.id]} />
            </div>
            <div className="space-y-14 py-10 sm:py-14">
            <Section id="outcomes" title="ماذا ستتعلم؟">
              <ul className="grid gap-x-8 gap-y-3.5 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-2">
                {course.whatYouWillLearn.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-soft">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="المهارات">
                {course.skills.map((skill) => (
                  <Badge key={skill} tone="outline" className="px-2.5 py-1 text-sm">
                    <bdi dir="ltr">{skill}</bdi>
                  </Badge>
                ))}
              </div>
            </Section>

            <Section id="about" title="عن الكورس">
              <p className="max-w-[68ch] text-[1.05rem] leading-8 text-ink-soft">{course.description}</p>
            </Section>

            <Section
              id="curriculum"
              title="محتوى الكورس"
              aside={`${course.curriculum.length} أقسام، ${formatLessons(course.lessons)}، ${formatHours(course.duration)}`}
            >
              <Curriculum course={course} enrollment={enrollment} />
            </Section>

            <Section id="requirements" title="متطلبات الكورس">
              <ul className="space-y-2.5">
                {course.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-3 text-ink-soft">
                    <CircleDot className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    {req}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="instructor" title="عن المدرب">
              <InstructorCard instructor={course.instructor} bio={course.instructorBio} stats={instructorStats} />
            </Section>

            <Section id="reviews" title="آراء الطلاب">
              <ReviewsSection course={course} canReview={Boolean(enrollment)} userId={user?.id} onReviewed={reload} />
            </Section>
          </div>
          </div>

          <aside className="relative hidden pt-10 lg:block" aria-label="الاشتراك في الكورس">
            <div className="sticky top-24 pb-14">
              <PurchaseCard course={course} enrolled={Boolean(enrollment)} enrolling={enrolling} onEnroll={handleEnroll} certificate={certificates[course.id]} />
            </div>
          </aside>
        </div>
      </div>

      <section className="border-t border-line bg-surface py-14" aria-labelledby="related-title">
        <div className="container-page">
          <SectionHeader id="related-title" title="كورسات مشابهة" description="ممكن تكمّل بيها بعد الكورس ده." />
          {related.loading ? (
            <CourseGridSkeleton count={4} />
          ) : related.error ? (
            <ErrorState error={related.error} onRetry={related.reload} />
          ) : (
            <CourseGrid courses={related.data} categoryMap={categoryMap} />
          )}
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">{course.title}</p>
            <p className="font-display text-lg font-bold">{formatPrice(course.price)}</p>
          </div>
          {enrollment ? (
            <Button to={`/learn/${course.id}`}>تابع التعلّم</Button>
          ) : (
            <Button onClick={handleEnroll} loading={enrolling}>
              اشترك الآن
            </Button>
          )}
        </div>
      </div>

      <AuthPromptModal open={authPrompt} onClose={() => setAuthPrompt(false)} courseTitle={course.title} />
    </>
  );
}
