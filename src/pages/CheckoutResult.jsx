import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useLearning } from '@/context/LearningContext';
import { confirmOrder, getOrder } from '@/services/api';
import { formatPrice } from '@/utils/format';

export default function CheckoutResult() {
  usePageMeta('نتيجة الدفع');
  const [params] = useSearchParams();
    // `ref` is our order id. Paymob appends its own params (including its own `order`), so we never read `order`.
  const orderId = params.get('ref') || params.get('merchant_order_id');
  const { refresh } = useLearning();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const tries = useRef(0);

  useEffect(() => {
    if (!orderId) return undefined;
    let timer;
    let active = true;
    const query = Object.fromEntries(params.entries());

    const poll = async (first) => {
      try {
        // First call forwards Paymob's redirect params so the API can verify them.
        const o = first && query.hmac ? await confirmOrder(orderId, query) : await getOrder(orderId);
        if (!active) return;
        setOrder(o);
        if (o.status === 'paid') refresh();
        if (o.status === 'pending' && tries.current++ < 10) timer = setTimeout(() => poll(false), 3000);
      } catch (e) {
        if (active) setError(e);
      }
    };
    poll(true);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!orderId || error) {
    return (
      <Shell icon={XCircle} tone="text-danger" title="مش لاقيين الطلب ده" text={error?.message || 'الرابط ناقص رقم الطلب.'}>
        <Button to="/my-courses">كورساتي</Button>
      </Shell>
    );
  }
  if (!order) {
    return (
      <div className="container-page max-w-md py-24">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }
  if (order.status === 'paid') {
    return (
      <Shell icon={CheckCircle2} tone="text-primary" title="تم الدفع بنجاح" text={`اشتركت في «${order.courseTitle}». وصلك إيصال على بريدك.`}>
        <p className="font-display text-2xl font-bold">{formatPrice(order.amount)}</p>
        <Button to={`/learn/${order.courseId}`} size="lg">
          ابدأ التعلّم
        </Button>
      </Shell>
    );
  }
  if (order.status === 'pending') {
    return (
      <Shell icon={Clock3} tone="text-accent" title="بنأكد عملية الدفع" text="ده بياخد ثواني. لو دفعت في منفذ أو بالمحفظة ممكن ياخد وقت أطول، وهنبعتلك إشعار أول ما يتأكد.">
        <Button to="/my-courses" variant="secondary">
          كورساتي
        </Button>
      </Shell>
    );
  }
  return (
    <Shell icon={XCircle} tone="text-danger" title="الدفع ما تمّش" text="مفيش أي مبلغ اتخصم. تقدر تحاول تاني بنفس الطريقة أو بطريقة دفع مختلفة.">
      <Button to={`/checkout/${order.courseId}`}>حاول تاني</Button>
    </Shell>
  );
}

function Shell({ icon: Icon, tone, title, text, children }) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <Icon className={`size-14 ${tone}`} aria-hidden="true" />
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted">{text}</p>
        <div className="mt-2 flex flex-col items-center gap-3">{children}</div>
      </div>
    </div>
  );
}
