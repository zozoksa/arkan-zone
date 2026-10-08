import { CheckCircle2 } from 'lucide-react';
import { LogoMark } from '@/components/common/Logo';

const points = ['معاينة مجانية لأول دروس كل كورس', 'تقدمك محفوظ وتكمل من مكان ما وقفت', 'مشاريع حقيقية لملف أعمالك'];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4.5rem)] items-center gap-12 py-10 lg:grid-cols-2 lg:py-16">
      <div className="mx-auto w-full max-w-md animate-fade-up">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>

      <div className="relative hidden h-full min-h-[34rem] overflow-hidden rounded-3xl bg-[#0f2a23] p-10 text-white lg:flex lg:flex-col lg:justify-between dark:bg-[#123a30]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgb(255_255_255/0.2)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.2)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(circle_at_70%_30%,black,transparent_70%)]"
          aria-hidden="true"
        />
        <LogoMark className="relative size-12" />
        <div className="relative">
          <p className="font-display text-3xl font-bold leading-snug">
            كل مهارة بتتعلمها
            <br />
            ركن جديد في مستقبلك.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="size-5 shrink-0 text-[#e9b052]" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
