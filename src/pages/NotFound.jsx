import Button from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('الصفحة غير موجودة');
  return (
    <section className="container-page flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p dir="ltr" className="corner-frame px-6 font-display text-7xl font-bold text-primary sm:text-8xl">
        404
      </p>
      <h1 className="mt-10 text-2xl font-bold sm:text-3xl">الصفحة دي مش موجودة</h1>
      <p className="mt-3 max-w-md text-muted">ممكن الرابط يكون اتغير أو اتكتب غلط. ارجع للرئيسية أو دوّر على كورس.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/">الرئيسية</Button>
        <Button to="/courses" variant="secondary">
          تصفح الكورسات
        </Button>
      </div>
    </section>
  );
}
