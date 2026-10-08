import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BadgePercent, CreditCard, Lock, ShieldCheck, Smartphone, Store } from 'lucide-react';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { CourseDetailsSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useLearning } from '@/context/LearningContext';
import { useToast } from '@/context/ToastContext';
import { getCheckoutQuote, getCourse, startCheckout } from '@/services/api';
import { formatPrice } from '@/utils/format';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isEnrolled, refresh } = useLearning();
  usePageMeta('إتمام الاشتراك');

  const { data: course, loading, error, reload } = useAsync(() => getCourse(id), [id]);
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState('');
  const [quote, setQuote] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!course) return;
    getCheckoutQuote(course.id, applied || undefined)
      .then(setQuote)
      .catch(() => setQuote(null));
  }, [course, applied]);

  if (loading) return <CourseDetailsSkeleton />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (isEnrolled(course.id)) return <Navigate to={`/learn/${course.id}`} replace />;

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setBusy(true);
    setCouponError('');
    try {
      const q = await getCheckoutQuote(course.id, couponInput.trim());
      setQuote(q);
      setApplied(q.coupon.code);
      toast({ title: `تم تطبيق خصم ${q.coupon.percent}%` });
    } catch (err) {
      setCouponError(err.details?.coupon || err.message);
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    setPaying(true);
    try {
      const result = await startCheckout(course.id, applied || undefined);
      if (result.status === 'enrolled') {
        await refresh();
        toast({ title: 'تم الاشتراك في الكورس بنجاح' });
        navigate(`/learn/${course.id}`, { replace: true });
        return;
      }
      if (result.redirectUrl.startsWith(window.location.origin)) {
        navigate(result.redirectUrl.slice(window.location.origin.length));
      } else {
        window.location.assign(result.redirectUrl);
      }
    } catch (err) {
      toast({ title: 'مقدرناش نبدأ الدفع', description: err.message, variant: 'error' });
      setPaying(false);
    }
  };

  const total = quote?.total ?? course.price;
  const methods = [
    { icon: CreditCard, label: 'كروت بنكية' },
    { icon: Smartphone, label: 'محافظ إلكترونية' },
    { icon: Store, label: 'دفع في منافذ' },
  ];

  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'الكورسات', to: '/courses' }, { label: course.title, to: `/courses/${course.id}` }, { label: 'إتمام الاشتراك' }]} />
      <h1 className="mt-6 text-3xl font-bold">إتمام الاشتراك</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl">
              <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="sm" />
            </div>
            <div className="min-w-0">
              <Link to={`/courses/${course.id}`} className="font-display text-lg font-medium hover:text-primary">
                {course.title}
              </Link>
              <p className="text-sm text-muted">{course.instructor.name}</p>
              <p className="mt-2 text-sm text-ink-soft">وصول مدى الحياة، وشهادة إتمام</p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 font-sans font-semibold">
              <BadgePercent className="size-5 text-primary" aria-hidden="true" />
              عندك كود خصم؟
            </h2>
            <form onSubmit={applyCoupon} className="mt-4 flex gap-3">
              <Input
                className="flex-1"
                aria-label="كود الخصم"
                dir="ltr"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="WELCOME20"
                error={couponError}
              />
              <Button type="submit" variant="secondary" loading={busy} className="h-11">
                تطبيق
              </Button>
            </form>
            {applied && (
              <button
                type="button"
                className="mt-3 text-sm text-muted hover:text-danger"
                onClick={() => {
                  setApplied('');
                  setCouponInput('');
                }}
              >
                إلغاء الكود {applied}
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-sans font-semibold">طرق الدفع المتاحة</h2>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {methods.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2 rounded-xl border border-line p-3 text-center text-sm text-ink-soft">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">هتختار طريقة الدفع في الصفحة الآمنة لبوابة الدفع بعد ما تدوس «ادفع».</p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">ملخص الطلب</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">سعر الكورس</dt>
              <dd>{formatPrice(course.price)}</dd>
            </div>
            {quote?.discount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>خصم ({quote.coupon.code})</dt>
                <dd>- {formatPrice(quote.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <dt>الإجمالي</dt>
              <dd className="font-display text-xl">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button size="lg" className="mt-6 w-full" onClick={pay} loading={paying}>
            <Lock className="size-4" aria-hidden="true" />
            {total === 0 ? 'اشترك مجانًا' : `ادفع ${formatPrice(total)}`}
          </Button>
          {quote?.paymentMode === 'mock' && total > 0 && (
            <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-xs text-ink-soft">
              وضع التجربة: بوابة الدفع مش متوصلة، وهتظهرلك صفحة دفع تجريبية.
            </p>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            بيانات الكارت مش بتعدّي على سيرفراتنا. الدفع بيتم عن طريق Paymob، وعندك 14 يوم لطلب الاسترداد.
          </p>
        </aside>
      </div>
    </div>
  );
}
