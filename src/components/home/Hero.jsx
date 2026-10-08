import { BadgeCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import HeroVisual from './HeroVisual';
import { useAuth } from '@/context/AuthContext';

const learners = ['سارة محمود', 'كريم حسن', 'مريم خالد', 'يوسف عادل'];

export default function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden">
      {/* Quiet structural grid behind the hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="container-page relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-soft">
            <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
            كورسات عربية بمشاريع حقيقية
          </p>
          <h1 className="mt-6 text-[2.25rem] font-bold leading-[1.25] tracking-tight sm:text-5xl lg:text-[3.15rem] xl:text-[3.5rem]">
            اتعلم مهارات المستقبل
            <br />
            وابني مستقبلك بنفسك
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-pretty text-ink-soft">
            كورسات عملية مصممة تساعدك على تعلم المهارات المطلوبة وبناء مشاريع حقيقية.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/courses" size="lg">
              استكشف الكورسات
            </Button>
            <Button to={user ? '/dashboard' : '/register'} size="lg" variant="secondary">
              ابدأ رحلتك
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {learners.map((name) => (
                <Avatar key={name} name={name} size="sm" className="ring-2 ring-canvas" />
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">+10 آلاف طالب</span> بيتعلموا معانا من مصر والوطن العربي
            </p>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
