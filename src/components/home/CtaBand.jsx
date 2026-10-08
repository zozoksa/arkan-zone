import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function CtaBand() {
  const { user } = useAuth();
  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-[#0f2a23] px-6 py-12 text-center sm:px-12 sm:py-16 dark:bg-[#123a30]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(255_255_255/0.25)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white sm:text-4xl">أول درس مجاني في كل كورس</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            اعمل حسابك في أقل من دقيقة، وجرّب المعاينة المجانية قبل ما تقرر.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to={user ? '/courses' : '/register'} size="lg" variant="inverse">
              {user ? 'تصفح الكورسات' : 'أنشئ حسابك مجانًا'}
            </Button>
            <Button to="/courses?price=free" size="lg" variant="ghost-inverse">
              الكورسات المجانية
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
