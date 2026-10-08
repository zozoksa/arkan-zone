import { Link } from 'react-router-dom';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export default function EnrolledCourseCard({ item, layout = 'card', certificate }) {
  const { course, progress, next } = item;
  const done = progress === 100;
  const cta = done ? 'راجع الكورس' : progress === 0 ? 'ابدأ الكورس' : 'استكمل';

  if (layout === 'row') {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3">
        <Link to={`/courses/${course.id}`} className="h-16 w-24 shrink-0 overflow-hidden rounded-xl" tabIndex={-1}>
          <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/courses/${course.id}`} className="block truncate font-medium text-ink hover:text-primary">
            {course.title}
          </Link>
          <ProgressBar value={progress} size="sm" className="mt-2" label={done ? 'مكتمل' : `الدرس الجاي: ${next?.title}`} />
        </div>
        <Button to={`/learn/${course.id}`} variant="secondary" size="sm" className="hidden sm:inline-flex">
          {cta}
        </Button>
      </div>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-card">
      <div className="aspect-[16/9] overflow-hidden">
        <CourseThumbnail thumbnail={course.thumbnail} title={course.title} className="transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display font-medium">
          <Link to={`/courses/${course.id}`} className="hover:text-primary">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{course.instructor.name}</p>
        <ProgressBar value={progress} className="mt-5" label={done ? 'أكملت الكورس' : 'التقدم'} />
        <div className="min-h-4 flex-1" />
        <Button to={`/learn/${course.id}`} variant={done ? 'secondary' : 'primary'} className={cn('mt-4 w-full')}>
          {cta}
        </Button>
        {certificate && (
          <Button to={`/certificates/${certificate}`} variant="soft" className="mt-2 w-full">
            عرض الشهادة
          </Button>
        )}
      </div>
    </article>
  );
}
