import { CheckCircle2, Mail, MessageSquare } from 'lucide-react';
import ErrorState from '@/components/common/ErrorState';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { admin } from '@/services/api';
import { timeAgo } from '@/utils/format';

export default function AdminMessages() {
  usePageMeta('الرسائل');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => admin.messages(), []);

  const setHandled = async (m, handled) => {
    try {
      await admin.setHandled(m.id, handled);
      reload();
    } catch (err) {
      toast({ title: err.message, variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">رسائل التواصل</h1>
      {loading ? (
        <Skeleton className="h-60 rounded-2xl" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState icon={MessageSquare} title="مفيش رسائل" description="الرسائل اللي بتيجي من صفحة تواصل معنا هتظهر هنا." />
      ) : (
        <ul className="space-y-3">
          {data.map((m) => (
            <li key={m.id} className={`rounded-2xl border bg-surface p-5 ${m.handled ? 'border-line opacity-75' : 'border-primary/30'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-medium text-ink">{m.name}</p>
                <a href={`mailto:${m.email}`} dir="ltr" className="text-sm text-muted hover:text-primary">
                  {m.email}
                </a>
                <span className="text-xs text-muted">{timeAgo(m.createdAt)}</span>
                {m.handled ? <Badge tone="outline">تم الرد</Badge> : <Badge tone="accent">جديدة</Badge>}
              </div>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink-soft">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" href={`mailto:${m.email}?subject=${encodeURIComponent('رد من Arkan Zone')}`}>
                  <Mail className="size-4" aria-hidden="true" />
                  رد بالإيميل
                </Button>
                <Button size="sm" variant={m.handled ? 'ghost' : 'soft'} onClick={() => setHandled(m, !m.handled)}>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {m.handled ? 'رجّعها جديدة' : 'اتعمل رد'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
