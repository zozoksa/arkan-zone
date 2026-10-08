import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const btn = 'grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-medium transition-colors';

  return (
    <nav aria-label="التنقل بين الصفحات" className={cn('flex items-center justify-center gap-2', className)}>
      <button
        type="button"
        className={cn(btn, 'border-line bg-surface text-ink-soft hover:border-line-strong disabled:opacity-40')}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="size-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            btn,
            p === page
              ? 'border-primary bg-primary text-on-primary'
              : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={cn(btn, 'border-line bg-surface text-ink-soft hover:border-line-strong disabled:opacity-40')}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="size-4" />
      </button>
    </nav>
  );
}
