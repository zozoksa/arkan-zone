import { useParams } from 'react-router-dom';
import { BadgeCheck, Printer, SearchX } from 'lucide-react';
import { LogoMark } from '@/components/common/Logo';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getCertificate } from '@/services/api';
import { formatDate, formatHours } from '@/utils/format';

/** Public, printable certificate. The URL itself is the verification link. */
export default function Certificate() {
  const { code } = useParams();
  const { data: cert, loading, error, reload } = useAsync(() => getCertificate(code), [code]);
  usePageMeta(cert ? `شهادة ${cert.studentName} — ${cert.courseTitle}` : 'شهادة إتمام');

  if (loading) {
    return (
      <div className="container-page py-12">
        <Skeleton className="mx-auto aspect-[1.414] max-w-4xl rounded-2xl" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page py-16">
        {error.status === 404 ? (
          <EmptyState icon={SearchX} title="الشهادة دي مش موجودة" description="اتأكد من رقم الشهادة. الرقم بيبدأ بـ AZ." action={<Button to="/">الرئيسية</Button>} />
        ) : (
          <ErrorState error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const url = `${window.location.origin}/certificates/${cert.code}`;
  return (
    <div className="container-page py-10 print:p-0">
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="inline-flex items-center gap-2 text-sm text-primary">
          <BadgeCheck className="size-5" aria-hidden="true" />
          شهادة موثّقة صادرة من Arkan Zone
        </p>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden="true" />
          تحميل PDF / طباعة
        </Button>
      </div>

      <article className="certificate relative mx-auto aspect-[1.414] max-w-4xl overflow-hidden rounded-2xl border border-line bg-white p-[5%] text-[#15201b] shadow-card print:rounded-none print:border-0 print:shadow-none">
        <div className="pointer-events-none absolute inset-[3%] rounded-xl border-2 border-[#0f6b57]/30" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#0f6b57_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
        <div className="relative flex h-full flex-col items-center justify-between text-center">
          <div className="flex items-center gap-3">
            <LogoMark className="size-10 sm:size-12" />
            <span dir="ltr" className="font-display text-xl font-bold sm:text-2xl">
              Arkan Zone
            </span>
          </div>
          <div>
            <p className="text-sm text-[#64716b] sm:text-lg">شهادة إتمام</p>
            <p className="mt-1 text-xs text-[#64716b] sm:mt-3 sm:text-base">تشهد منصة Arkan Zone بأن</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[#0f6b57] sm:mt-4 sm:text-5xl">{cert.studentName}</h1>
            <p className="mt-2 text-xs text-[#3b4943] sm:mt-4 sm:text-lg">أتمّ بنجاح جميع دروس ومشاريع كورس</p>
            <p className="mt-1 font-display text-lg font-bold sm:mt-2 sm:text-3xl">{cert.courseTitle}</p>
            <p className="mt-1 text-xs text-[#64716b] sm:mt-2 sm:text-base">مدة الكورس: {formatHours(cert.hours)}</p>
          </div>
          <div className="grid w-full grid-cols-3 items-end gap-2 text-[10px] sm:text-sm">
            <div>
              <p className="font-medium">{cert.instructorName}</p>
              <p className="text-[#64716b]">المدرب</p>
            </div>
            <div>
              <p className="font-medium" dir="ltr">
                {cert.code}
              </p>
              <p className="text-[#64716b]">رقم التحقق</p>
            </div>
            <div>
              <p className="font-medium">{formatDate(cert.issuedAt)}</p>
              <p className="text-[#64716b]">تاريخ الإصدار</p>
            </div>
            <p className="col-span-3 mt-2 text-[9px] text-[#64716b] sm:text-xs" dir="ltr">
              {url}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
