import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/utils/cn';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: Escape closes, focus is trapped and restored,
 * body scroll is locked. `variant="sheet"` slides in from the inline-start edge.
 */
export default function Modal({ open, onClose, title, description, children, size = 'md', variant = 'dialog', className }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    (panel.querySelector('[data-autofocus]') || panel.querySelector(FOCUSABLE) || panel).focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const nodes = [...panel.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  const isSheet = variant === 'sheet';

  return createPortal(
    <div className={cn('fixed inset-0 z-[60] flex', isSheet ? 'justify-start' : 'items-end justify-center p-0 sm:items-center sm:p-6')}>
      <div className="absolute inset-0 animate-fade-in bg-[#06100d]/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-full w-full flex-col bg-surface shadow-pop outline-none',
          isSheet
            ? 'h-full max-w-[22rem] animate-sheet-in border-e border-line'
            : cn('max-h-[92vh] animate-scale-in rounded-t-2xl border border-line sm:rounded-2xl', sizes[size]),
          className,
        )}
      >
        {(title || !isSheet) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-bold">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-me-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-sunken hover:text-ink"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
