import { BarChart3, Clock3, PlayCircle, RefreshCw, Users } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import Avatar from '@/components/ui/Avatar';
import { courseBadge, levelName } from '@/utils/courseMeta';
import { formatDate, formatHours, formatLessons, formatNumber } from '@/utils/format';

function Meta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4 text-muted" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function CourseHeader({ course, category }) {
  const badge = courseBadge(course);
  return (
    <div className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'الرئيسية', to: '/' },
          { label: 'الكورسات', to: '/courses' },
          { label: category?.name || 'تصنيف', to: `/courses?category=${course.category}` },
          { label: course.title },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="outline">{category?.name}</Badge>
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-[2.6rem]">{course.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{course.shortDescription}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-soft">
        <Rating value={course.rating} count={course.ratingCount} />
        <Meta icon={Users}>{formatNumber(course.students)} طالب</Meta>
        <Meta icon={BarChart3}>{levelName(course.level)}</Meta>
        <Meta icon={Clock3}>{formatHours(course.duration)}</Meta>
        <Meta icon={PlayCircle}>{formatLessons(course.lessons)}</Meta>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <a href="#instructor" className="flex items-center gap-3 rounded-xl hover:opacity-90">
          <Avatar name={course.instructor.name} />
          <span>
            <span className="block text-muted">المدرب</span>
            <span className="block font-medium text-ink">{course.instructor.name}</span>
          </span>
        </a>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <RefreshCw className="size-4" aria-hidden="true" />
          آخر تحديث {formatDate(course.createdAt)}
        </span>
      </div>
    </div>
  );
}
