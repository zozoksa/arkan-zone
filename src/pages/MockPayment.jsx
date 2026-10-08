import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, FlaskConical } from 'lucide-react';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getOrder, mockPay } from '@/services/api';
import { formatPrice } from '@/utils/format';

/** Development-only stand-in for the payment provider page. */
export default function MockPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  usePageMeta('دفع تجريبي');
  const { data: order, loading, error, reload } = useAsync(() => getOrder(orderId), [orderId]);
  const [busy, setBusy] = useState(null);

  const finish = async (success) => {
    setBusy(success ? 'pay' : 'fail');
    try {
      await mockPay(orderId, success);
    } finally {
        navigate(`/checkout/result?ref=${orderId}`, { replace: true });
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm text-ink-soft">
          <FlaskConical className="size-4" aria-hidden="true" />
          بوابة دفع تجريبية (للتطوير فقط)
        </p>
        {loading ? (
          <Skeleton className="mt-6 h-32 rounded-xl" />
        ) : error ? (
          <div className="mt-6">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-2xl font-bold">{order.courseTitle}</h1>
            <p className="mt-2 font-display text-3xl font-bold">{formatPrice(order.amount)}</p>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-line p-4 text-sm text-ink-soft">
              <CreditCard className="size-5 text-primary" aria-hidden="true" />
              <span dir="ltr">4242 4242 4242 4242</span>
            </div>
            {order.status !== 'pending' ? (
             <Button className="mt-6 w-full" onClick={() => navigate(`/checkout/result?ref=${orderId}`)}></Button>
            ) : (
              <div className="mt-6 grid gap-3">
                <Button size="lg" onClick={() => finish(true)} loading={busy === 'pay'} disabled={Boolean(busy)}>
                  إتمام الدفع بنجاح
                </Button>
                <Button variant="secondary" onClick={() => finish(false)} loading={busy === 'fail'} disabled={Boolean(busy)}>
                  محاكاة فشل الدفع
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
