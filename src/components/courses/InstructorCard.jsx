import { BookOpen, Star, Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { formatCompact } from '@/utils/format';

export default function InstructorCard({ instructor, bio, stats }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center gap-4">
        <Avatar name={instructor.name} size="lg" />
        <div>
          <p className="font-display text-lg font-medium text-ink">{instructor.name}</p>
          <p className="text-sm text-muted">{instructor.title}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-xl bg-raised py-3 text-center">
        <div>
          <dt className="flex items-center justify-center gap-1 text-xs text-muted">
            <Star className="size-3.5" aria-hidden="true" /> التقييم
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{stats.rating.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="flex items-center justify-center gap-1 text-xs text-muted">
            <Users className="size-3.5" aria-hidden="true" /> الطلاب
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{formatCompact(stats.students)}</dd>
        </div>
        <div>
          <dt className="flex items-center justify-center gap-1 text-xs text-muted">
            <BookOpen className="size-3.5" aria-hidden="true" /> الكورسات
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{stats.courses}</dd>
        </div>
      </dl>
      <p className="mt-5 leading-8 text-ink-soft">{bio}</p>
    </div>
  );
}
