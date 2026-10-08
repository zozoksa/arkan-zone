import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * items: [{ id, title, meta?, content }]
 * Height animation uses the grid-rows 0fr → 1fr technique (no JS measuring).
 */
export default function Accordion({ items, defaultOpen = [], allowMultiple = true, className }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id}>
            <h3 className="font-sans text-base">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-3 px-5 py-4 text-start transition-colors hover:bg-raised"
              >
                <ChevronDown
                  className={cn('size-5 shrink-0 text-muted transition-transform duration-300', isOpen && 'rotate-180 text-primary')}
                  aria-hidden="true"
                />
                <span className="flex-1 font-semibold text-ink">{item.title}</span>
                {item.meta && <span className="hidden text-sm text-muted sm:inline">{item.meta}</span>}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
              inert={!isOpen || undefined}
            >
              <div className="overflow-hidden">
                <div className="border-t border-line bg-raised/60">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
