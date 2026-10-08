import { Link } from 'react-router-dom';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

const icons = { success: CheckCircle2, info: Info, error: AlertTriangle };
const tones = { success: 'text-primary', info: 'text-ink-soft', error: 'text-danger' };

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:items-end"
      role="region"
      aria-label="الإشعارات"
    >
      {toasts.map((t) => {
        const Icon = icons[t.variant] || Info;
        return (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-pop"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', tones[t.variant])} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              {t.action && (
                <Link to={t.action.to} onClick={() => onDismiss(t.id)} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                  {t.action.label}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-sunken hover:text-ink"
              aria-label="إغلاق الإشعار"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
