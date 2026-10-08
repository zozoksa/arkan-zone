import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/** Brand mark: four "arkan" (corners) framing a core square. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9', className)} aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" className="text-on-primary">
        <path d="M10 17.5V10h7.5" />
        <path d="M22.5 10H30v7.5" />
        <path d="M30 22.5V30h-7.5" />
        <path d="M17.5 30H10v-7.5" />
      </g>
      <rect x="16.5" y="16.5" width="7" height="7" rx="1.6" className="fill-accent" />
    </svg>
  );
}

export default function Logo({ className, to = '/' }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="Arkan Zone — الصفحة الرئيسية">
      <LogoMark />
      <span dir="ltr" className="font-display text-[1.15rem] font-bold tracking-tight text-ink">
        Arkan<span className="font-medium text-muted"> Zone</span>
      </span>
    </Link>
  );
}
