import { cn } from '@/utils/cn';

const tones = {
  neutral: 'bg-sunken text-ink-soft',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-[color-mix(in_oklab,var(--accent)_75%,var(--ink))]',
  solid: 'bg-ink text-canvas',
  outline: 'border border-line text-ink-soft',
};

export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-5', tones[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}
