import { Award, Flame, Play } from 'lucide-react';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import ProgressBar from '@/components/ui/ProgressBar';

const week = [
  { day: 'س', h: 40 },
  { day: 'ح', h: 65 },
  { day: 'ن', h: 30 },
  { day: 'ث', h: 85 },
  { day: 'ر', h: 55 },
  { day: 'خ', h: 100 },
  { day: 'ج', h: 20 },
];

/** Decorative product composition for the hero, built from real UI parts (no stock imagery). */
export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[30rem] py-6 lg:max-w-none" aria-hidden="true">
      {/* Main "now learning" card */}
      <div className="corner-frame relative z-10 mx-auto mt-8 w-[88%] animate-fade-up rounded-2xl border border-line bg-surface p-3 shadow-lift [animation-delay:150ms] sm:w-[80%]">
        <div className="aspect-[16/9] overflow-hidden rounded-xl">
          <CourseThumbnail thumbnail={{ mark: 'Re', pattern: 'arcs', from: '#1E5A6B', to: '#123A46' }} title="React للمطورين" size="lg" />
        </div>
        <div className="px-2 pb-2 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted">بتتعلم دلوقتي</p>
              <p className="truncate font-display font-medium text-ink">React للمطورين</p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
              <Play className="size-4 fill-current" />
            </span>
          </div>
          <ProgressBar value={64} label="الدرس 9 من 14" className="mt-4" />
          <p className="mb-4 mt-3 rounded-lg bg-raised px-3 py-2 text-xs text-ink-soft sm:mb-6">
            الدرس الجاي: <span className="font-medium text-ink">Custom Hooks</span>
          </p>
        </div>
      </div>

      {/* Streak — sits on the thumbnail's top corner */}
      <div className="absolute start-0 top-0 z-20 animate-fade-up rounded-2xl border border-line bg-surface px-3.5 py-2.5 shadow-card [animation-delay:350ms] lg:-start-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
            <Flame className="size-5" />
          </span>
          <div>
            <p className="font-display font-bold leading-tight text-ink">12 يوم</p>
            <p className="text-xs text-muted">تعلّم متواصل</p>
          </div>
        </div>
      </div>

      {/* Weekly activity — floats beside the card on larger screens */}
      <div className="absolute end-0 top-[16%] z-20 hidden w-44 animate-fade-up rounded-2xl border border-line bg-surface p-3.5 shadow-card [animation-delay:500ms] sm:block lg:-end-6">
        <div className="animate-float">
          <p className="text-xs text-muted">ساعات التعلم الأسبوع ده</p>
          <p className="font-display text-xl font-bold text-ink">
            6.5 <span className="text-sm font-medium text-muted">ساعة</span>
          </p>
          <div className="mt-3 flex h-14 items-end gap-1.5">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className={`w-full rounded-sm ${d.h === 100 ? 'bg-primary' : 'bg-primary/25'}`} style={{ height: `${d.h * 0.4}px` }} />
                <span className="text-[10px] text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="absolute -bottom-2 start-[8%] z-20 hidden animate-fade-up items-center gap-2 rounded-full border border-line bg-surface py-2 ps-2 pe-4 text-sm shadow-card [animation-delay:650ms] sm:flex">
        <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-primary">
          <Award className="size-4" />
        </span>
        <span className="text-ink-soft">
          شهادة جديدة: <span dir="ltr" className="font-medium text-ink">JavaScript</span>
        </span>
      </div>
    </div>
  );
}
