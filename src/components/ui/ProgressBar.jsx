import { cn } from '@/utils/cn';

export default function ProgressBar({ value, label, showValue = true, size = 'md', className }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted">{label}</span>}
          {showValue && <span className="font-semibold tabular-nums text-ink">{clamped}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label || 'نسبة التقدم'}
        className={cn('overflow-hidden rounded-full bg-sunken', size === 'sm' ? 'h-1.5' : 'h-2')}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', clamped === 100 ? 'bg-accent' : 'bg-primary')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
