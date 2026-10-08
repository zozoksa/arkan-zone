import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Circle, FileText, HelpCircle, PlayCircle, Wrench } from 'lucide-react';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { CourseDetailsSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useLearning } from '@/context/LearningContext';
import { useToast } from '@/context/ToastContext';
import { getCourse, getLessonPlayback } from '@/services/api';
import { allLessons, courseProgress, nextLesson } from '@/utils/progress';
import { lessonTypeLabel } from '@/utils/courseMeta';
import { formatMinutes } from '@/utils/format';
import { cn } from '@/utils/cn';

const typeIcons = { video: PlayCircle, article: FileText, quiz: HelpCircle, project: Wrench };

/** Prototype lesson player: navigation + completion tracking (no real media yet). */
export default function Learn() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { enrollments, certificates, completeLesson, openLesson, loading: learningLoading } = useLearning();
  const toast = useToast();
  const { data: course, loading, error, reload } = useAsync(() => getCourse(id), [id]);
  const enrollment = course ? enrollments[course.id] : null;

  const lessons = useMemo(() => allLessons(course), [course]);
  const lessonId = params.get('lesson') || enrollment?.lastLessonId || nextLesson(course, enrollment)?.id;
  const index = Math.max(0, lessons.findIndex((l) => l.id === lessonId));
  const lesson = lessons[index];
  const done = new Set(enrollment?.completedLessons || []);

  usePageMeta(lesson ? `${lesson.title} — ${course.title}` : 'مشغّل الدروس');

  const playback = useAsync(
    () => (course && lesson && enrollment ? getLessonPlayback(course.id, lesson.id) : Promise.resolve(null)),
    [course?.id, lesson?.id, Boolean(enrollment)],
  );

  useEffect(() => {
    if (course && enrollment && lesson) openLesson(course.id, lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, lesson?.id]);

  if (loading || learningLoading) return <CourseDetailsSkeleton />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!enrollment) return <Navigate to={`/courses/${course.id}`} replace />;

  const go = (l) => l && setParams({ lesson: l.id });
  const progress = courseProgress(course, enrollment);
  const Icon = typeIcons[lesson.type] || PlayCircle;

  const certificate = certificates[course.id];
  const markDone = async () => {
    const isLast = index === lessons.length - 1;
    if (!isLast) go(lessons[index + 1]);
    try {
      const result = await completeLesson(course, lesson);
      if (result?.certificate && !certificate) {
        toast({
          title: 'مبروك! أكملت الكورس',
          description: 'شهادتك جاهزة ووصلتلك على البريد.',
          action: { label: 'عرض الشهادة', to: `/certificates/${result.certificate}` },
          duration: 8000,
        });
      }
    } catch (error) {
      toast({ title: 'مقدرناش نحفظ تقدمك', description: error.message, variant: 'error' });
    }
  };

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: 'كورساتي', to: '/my-courses' }, { label: course.title, to: `/courses/${course.id}` }, { label: lesson.title }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
            {playback.data?.embedUrl ? (
              <iframe
                key={lesson.id}
                src={playback.data.embedUrl}
                title={lesson.title}
                className="absolute inset-0 size-full border-0"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <>
                <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="lg" />
                <div className="absolute inset-0 grid place-items-center bg-black/35 p-6 text-center text-white">
                  <div>
                    <Icon className="mx-auto size-12 opacity-90" aria-hidden="true" />
                    <p className="mt-3 font-display text-xl font-medium sm:text-2xl">{lesson.title}</p>
                    <p className="mt-1 text-sm text-white/75">
                      {lessonTypeLabel[lesson.type]}، {formatMinutes(lesson.minutes)}
                      {playback.loading ? '' : '. فيديو الدرس ده لسه ما اترفعش.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => go(lessons[index - 1])} disabled={index === 0}>
                <ChevronRight className="size-4" aria-hidden="true" />
                السابق
              </Button>
              <Button variant="secondary" size="sm" onClick={() => go(lessons[index + 1])} disabled={index === lessons.length - 1}>
                التالي
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
            </div>
            {done.has(lesson.id) ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                الدرس ده مكتمل
              </span>
            ) : (
              <Button onClick={markDone}>
                <CheckCircle2 className="size-4" aria-hidden="true" />
                أكملت الدرس
              </Button>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface" aria-label="محتوى الكورس">
          <div className="border-b border-line p-5">
            <Link to={`/courses/${course.id}`} className="font-display font-medium hover:text-primary">
              {course.title}
            </Link>
            <ProgressBar value={progress} className="mt-3" label={`${done.size} من ${course.lessons} درس`} />
            {certificate && (
              <Button to={`/certificates/${certificate}`} variant="soft" size="sm" className="mt-4 w-full">
                <Award className="size-4" aria-hidden="true" />
                عرض شهادتك
              </Button>
            )}
          </div>
          <div className="max-h-[32rem] overflow-y-auto p-2">
            {course.curriculum.map((section) => (
              <div key={section.id} className="mb-2">
                <p className="px-3 py-2 text-xs font-semibold text-muted">{section.title}</p>
                <ul>
                  {section.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => go(l)}
                          aria-current={active ? 'step' : undefined}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors',
                            active ? 'bg-primary-soft text-primary' : 'text-ink-soft hover:bg-sunken',
                          )}
                        >
                          {done.has(l.id) ? (
                            <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="مكتمل" />
                          ) : (
                            <Circle className="size-4 shrink-0 text-line-strong" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          <span className="text-xs tabular-nums text-muted">{formatMinutes(l.minutes)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
