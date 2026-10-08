import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCompact } from '@/utils/format';

/** Star rating. `compact` shows one star + number; full shows five partially filled stars. */
export default function Rating({ value, count, compact = false, size = 'sm', className }) {
  const iconSize = size === 'lg' ? 'size-5' : 'size-3.5';
  const label = `التقييم ${value.toFixed(1)} من 5${count ? ` من ${count} تقييم` : ''}`;

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-sm', className)} aria-label={label}>
        <Star className={cn(iconSize, 'fill-accent text-accent')} aria-hidden="true" />
        <span className="font-semibold text-ink">{value.toFixed(1)}</span>
        {count != null && <span className="text-muted">({formatCompact(count)})</span>}
      </span>
    );
  }

  const stars = Array.from({ length: 5 });
  return (
    <span className={cn('inline-flex items-center gap-2', className)} aria-label={label} role="img">
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5">
          {stars.map((_, i) => (
            <Star key={i} className={cn(iconSize, 'fill-sunken text-line-strong')} />
          ))}
        </span>
        <span className="absolute inset-y-0 start-0 flex gap-0.5 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
          {stars.map((_, i) => (
            <Star key={i} className={cn(iconSize, 'shrink-0 fill-accent text-accent')} />
          ))}
        </span>
      </span>
      <span className="text-sm font-semibold text-ink">{value.toFixed(1)}</span>
      {count != null && <span className="text-sm text-muted">({formatCompact(count)} تقييم)</span>}
    </span>
  );
}
