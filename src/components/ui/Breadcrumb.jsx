import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="مسار التنقل" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex min-w-0 items-center gap-1.5">
              {last || !item.to ? (
                <span className={cn('truncate', last && 'font-medium text-ink-soft')} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              )}
              {!last && <ChevronLeft className="size-3.5 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
