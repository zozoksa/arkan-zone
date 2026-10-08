import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpLeft, Clock3, Users } from 'lucide-react';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import FavoriteButton from '@/components/common/FavoriteButton';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import { courseBadge, levelName } from '@/utils/courseMeta';
import { formatCompact, formatHours, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

function CourseCard({ course, categoryName, className, style }) {
  const badge = courseBadge(course);
  const free = course.price === 0;

  return (
    <article
      style={style}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-1 hover:border-line-strong hover:shadow-lift focus-within:border-line-strong',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CourseThumbnail
          thumbnail={course.thumbnail}
          title={course.title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {badge && (
          <Badge tone={badge.tone} className="absolute start-3 top-3 shadow-sm">
            {badge.label}
          </Badge>
        )}
        <FavoriteButton courseId={course.id} className="absolute end-3 top-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-primary">{categoryName}</span>
          <span className="text-muted">{levelName(course.level)}</span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-[1.05rem] font-medium leading-snug">
          <Link to={`/courses/${course.id}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-primary">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-muted">{course.instructor.name}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <Rating value={course.rating} compact />
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {formatCompact(course.students)}
            <span className="sr-only">طالب</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {formatHours(course.duration)}
          </span>
        </div>

        <div className="min-h-4 flex-1" aria-hidden="true" />
        <div className="flex items-center justify-between gap-2 border-t border-line pt-3.5">
          <div className="flex items-baseline gap-2">
            <span className={cn('font-display text-lg font-bold', free ? 'text-primary' : 'text-ink')}>{formatPrice(course.price)}</span>
            {course.oldPrice && (
              <span className="text-sm text-muted line-through">
                <span className="sr-only">بدلًا من </span>
                {formatPrice(course.oldPrice)}
              </span>
            )}
          </div>
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full border border-line text-ink-soft transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary"
          >
            <ArrowUpLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default memo(CourseCard);
