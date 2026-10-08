import { useState } from 'react';
import ErrorState from '@/components/common/ErrorState';
import DataTable from '@/components/admin/DataTable';
import OrderStatus, { providerLabel } from '@/components/admin/OrderStatus';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { admin } from '@/services/api';
import { formatDate, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

const tabs = [
  { id: '', label: 'الكل' },
  { id: 'paid', label: 'مدفوع' },
  { id: 'pending', label: 'معلّق' },
  { id: 'failed', label: 'فشل' },
];

export default function AdminOrders() {
  usePageMeta('الطلبات');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => admin.orders({ status, page, limit: 20 }), [status, page]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الطلبات</h1>
      <div role="tablist" className="flex w-fit rounded-xl bg-sunken p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={status === t.id}
            onClick={() => {
              setStatus(t.id);
              setPage(1);
            }}
            className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition', status === t.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <p className="text-sm text-muted">{data.meta.total} طلب</p>
          <DataTable
            rows={data.data}
            rowKey={(o) => o.id}
            empty="مفيش طلبات بالحالة دي"
            columns={[
              {
                key: 'user',
                label: 'الطالب',
                render: (o) => (
                  <span>
                    <span className="block text-ink">{o.userName}</span>
                    <span className="block text-xs text-muted" dir="ltr">{o.userEmail}</span>
                  </span>
                ),
              },
              { key: 'courseTitle', label: 'الكورس' },
              {
                key: 'amount',
                label: 'المبلغ',
                render: (o) => (
                  <span>
                    {formatPrice(o.amount)}
                    {o.coupon && <span className="block text-xs text-muted">{o.coupon} (−{formatPrice(o.discount)})</span>}
                  </span>
                ),
              },
              { key: 'provider', label: 'الطريقة', render: (o) => providerLabel[o.provider] || o.provider },
              { key: 'status', label: 'الحالة', render: (o) => <OrderStatus status={o.status} /> },
              { key: 'createdAt', label: 'التاريخ', render: (o) => formatDate(o.createdAt) },
            ]}
          />
          <Pagination page={page} totalPages={data.meta.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
