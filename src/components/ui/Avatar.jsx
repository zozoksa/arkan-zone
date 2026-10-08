import { useState } from 'react';
import { assetUrl } from '@/services/api';
import { cn } from '@/utils/cn';

const palette = ['#0F6B57', '#1E5A6B', '#5B3A6E', '#94600F', '#2E5E8C', '#4A5A2A', '#7B4A6A'];

function initials(name = '') {
  const parts = name.replace(/^(م|د|أ)\.\s*/, '').trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]).join('');
}

function colorFor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-24 text-3xl' };

export default function Avatar({ name, src, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={assetUrl(src)}
        alt={name}
        onError={() => setFailed(true)}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-display font-medium text-white', sizes[size], className)}
      style={{ backgroundColor: colorFor(name) }}
      role="img"
      aria-label={name}
    >
      <span aria-hidden="true">{initials(name)}</span>
    </span>
  );
}
