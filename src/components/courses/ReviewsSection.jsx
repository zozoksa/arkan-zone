import { Star } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Rating from '@/components/ui/Rating';
import ReviewForm from './ReviewForm';
import { formatDate, formatNumber } from '@/utils/format';

function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <Avatar name={review.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{review.name}</p>
          <p className="text-xs text-muted">{formatDate(review.date)}</p>
        </div>
        <span className="inline-flex items-center gap-0.5" aria-label={`${review.rating} من 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'fill-sunken text-line-strong'}`} aria-hidden="true" />
          ))}
        </span>
      </div>
      <p className="mt-3 leading-7 text-ink-soft">{review.comment}</p>
    </article>
  );
}

export default function ReviewsSection({ course, canReview, userId, onReviewed }) {
  const alreadyReviewed = Boolean(userId) && course.reviews.some((r) => r.userId === userId);
  // Mock distribution derived from the average so the bars feel plausible.
  const weights = [0.72, 0.19, 0.06, 0.02, 0.01].map((w, i) => (i === 0 ? w + (course.rating - 4.7) : w));
  const total = weights.reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="font-display text-5xl font-bold text-ink">{course.rating.toFixed(1)}</p>
        <Rating value={course.rating} className="mt-2" />
        <p className="mt-1 text-sm text-muted">من {formatNumber(course.ratingCount)} تقييم</p>
        <ul className="mt-5 space-y-2" aria-label="توزيع التقييمات">
          {weights.map((w, i) => {
            const pct = Math.round((Math.max(w, 0) / total) * 100);
            return (
              <li key={i} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-3 tabular-nums">{5 - i}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-8 text-end tabular-nums">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="space-y-4">
        {canReview && !alreadyReviewed && <ReviewForm courseId={course.id} onSubmitted={onReviewed} />}
        {course.reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-muted">مفيش تقييمات لسه. كن أول واحد يقيّم الكورس.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {course.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
