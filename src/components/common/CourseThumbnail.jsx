import { useId } from 'react';
import { cn } from '@/utils/cn';

/* Generated, asset-free course artwork: a two-tone field, a geometric
   pattern and the course "mark" set inside the brand's corner frame.
   If the API later returns `thumbnail.url`, a real image is used instead. */
function Pattern({ type, id }) {
  switch (type) {
    case 'star':
      return (
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="white" strokeOpacity="0.16" strokeWidth="1.2">
            <rect x="16" y="16" width="24" height="24" />
            <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
            <circle cx="28" cy="28" r="5" />
          </g>
        </pattern>
      );
    case 'grid':
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1" />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="1.6" fill="white" fillOpacity="0.22" />
        </pattern>
      );
    case 'lines':
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="white" strokeOpacity="0.12" strokeWidth="5" />
        </pattern>
      );
    default:
      return null;
  }
}

export default function CourseThumbnail({ thumbnail = {}, title, className, size = 'md' }) {
  const rawId = useId();
  const id = `p${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const { mark, pattern = 'grid', from = '#0F6B57', to = '#0A4537', url } = thumbnail;

  if (url) {
    return <img src={url} alt={title} className={cn('size-full object-cover', className)} loading="lazy" />;
  }

  const markSize = { sm: 'text-xl', md: 'text-[2.4rem]', lg: 'text-6xl' }[size];

  return (
    <div
      role="img"
      aria-label={`صورة كورس ${title}`}
      className={cn('relative isolate size-full overflow-hidden', className)}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <svg className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <Pattern type={pattern} id={id} />
        </defs>
        {pattern === 'arcs' ? (
          <g fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.3">
            {[60, 110, 160, 210, 260].map((r) => (
              <circle key={r} cx="0" cy="100%" r={r} />
            ))}
          </g>
        ) : (
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        )}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgb(255_255_255/0.18),transparent_55%)]" aria-hidden="true" />
      <span
        dir="ltr"
        aria-hidden="true"
        className={cn(
          'absolute bottom-[14%] left-[9%] font-display font-bold leading-none tracking-tight text-white/95 drop-shadow-sm',
          markSize,
        )}
      >
        {mark}
      </span>
      <span aria-hidden="true" className="absolute bottom-[14%] right-[8%] size-[16%] max-h-10 max-w-10 rounded-br-md border-b-2 border-r-2 border-white/40" />
    </div>
  );
}
