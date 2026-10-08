import { Link } from 'react-router-dom';
import { BookOpen, Clock3, MessageSquare, Users, Wallet } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ErrorState from '@/components/common/ErrorState';
import DataTable from '@/components/admin/DataTable';
import OrderStatus from '@/components/admin/OrderStatus';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { admin } from '@/services/api';
import { formatNumber, formatPrice, timeAgo } from '@/utils/format';

const dayFmt = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });

export default function AdminOverview() {
  usePageMeta('لوحة الإدارة');
  const { data, loading, error, reload } = useAsync(() => admin.stats(), []);
  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const max = Math.max(1, ...data.revenueByDay.map((d) => d.total));
  const twoWeeks = data.revenueByDay.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">نظرة عامة</h1>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={Wallet} label="إجمالي الإيرادات" value={formatPrice(data.revenue)} hint={`${data.paidOrders} طلب مدفوع`} />
        <StatCard icon={Users} label="المستخدمين" value={formatNumber(data.users)} hint={`+${data.newUsers} آخر 30 يوم`} />
        <StatCard icon={BookOpen} label="الاشتراكات" value={formatNumber(data.enrollments)} />
        <StatCard icon={Clock3} label="طلبات معلقة" value={data.pendingOrders} hint="في انتظار تأكيد الدفع" />
      </div>

      {data.unreadMessages > 0 && (
        <Link to="/admin/messages" className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm text-ink-soft hover:border-accent">
          <MessageSquare className="size-5 text-accent" aria-hidden="true" />
          عندك {data.unreadMessages} رسالة جديدة من نموذج التواصل
        </Link>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="rev-title">
          <div className="flex items-baseline justify-between">
            <h2 id="rev-title" className="text-lg font-bold">الإيرادات آخر 14 يوم</h2>
            <p className="font-display font-bold">{formatPrice(twoWeeks)}</p>
          </div>
          <div className="mt-6 flex h-48 items-end gap-1.5" role="img" aria-label="رسم بياني للإيرادات اليومية">
            {data.revenueByDay.map((d) => (
              <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="hidden text-[10px] text-muted group-hover:block">{d.total}</span>
                <span
                  className="w-full rounded-t-md bg-primary/80 transition-colors group-hover:bg-primary"
                  style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }}
                  title={`${d.day}: ${formatPrice(d.total)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{dayFmt.format(new Date(data.revenueByDay[0].day))}</span>
            <span>{dayFmt.format(new Date(data.revenueByDay.at(-1).day))}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="top-title">
          <h2 id="top-title" className="text-lg font-bold">أكتر كورسات اشتراكًا</h2>
          {data.topCourses.length === 0 ? (
            <p className="mt-4 text-sm text-muted">مفيش اشتراكات لسه.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {data.topCourses.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="grid size-7 place-items-center rounded-lg bg-sunken font-medium text-muted">{i + 1}</span>
                  <Link to={`/courses/${c.id}`} className="min-w-0 flex-1 truncate text-ink hover:text-primary">
                    {c.title}
                  </Link>
                  <span className="text-muted">{c.enrollments}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">أحدث الطلبات</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            كل الطلبات
          </Link>
        </div>
        <DataTable
          rows={data.recentOrders}
          rowKey={(o) => o.id}
          empty="مفيش طلبات لسه"
          columns={[
            { key: 'user', label: 'الطالب', render: (o) => <span className="text-ink">{o.userName}</span> },
            { key: 'courseTitle', label: 'الكورس' },
            { key: 'amount', label: 'المبلغ', render: (o) => formatPrice(o.amount) },
            { key: 'status', label: 'الحالة', render: (o) => <OrderStatus status={o.status} /> },
            { key: 'createdAt', label: 'من', render: (o) => timeAgo(o.createdAt) },
          ]}
        />
      </section>
    </div>
  );
}
