import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { levels } from '@/data/constants';
import { priceOptions, ratingOptions, sortOptions } from '@/data/navigation';
import { countActiveFilters } from '@/utils/courseFilters';
import { cn } from '@/utils/cn';

const levelOptions = [{ value: 'all', label: 'كل المستويات' }, ...levels.map((l) => ({ value: l.id, label: l.name }))];

function CategoryChips({ categories, value, onChange }) {
  const all = [{ id: 'all', name: 'الكل', courseCount: null }, ...categories];
  return (
    <div role="radiogroup" aria-label="التصنيف" className="flex flex-wrap gap-2">
      {all.map((cat) => {
        const active = value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(cat.id)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
              active
                ? 'border-ink bg-ink text-canvas'
                : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
            )}
          >
            {cat.name}
            {cat.courseCount != null && <span className={cn('text-xs', active ? 'opacity-70' : 'text-muted')}>{cat.courseCount}</span>}
          </button>
        );
      })}
    </div>
  );
}

function FilterFields({ filters, onChange, stacked }) {
  return (
    <div className={cn('grid gap-3', stacked ? 'grid-cols-1' : 'grid-cols-3')}>
      <Select label="المستوى" hideLabel={!stacked} options={levelOptions} value={filters.level} onChange={(v) => onChange({ level: v })} />
      <Select label="السعر" hideLabel={!stacked} options={priceOptions} value={filters.price} onChange={(v) => onChange({ price: v })} />
      <Select
        label="التقييم"
        hideLabel={!stacked}
        options={ratingOptions}
        value={String(filters.rating)}
        onChange={(v) => onChange({ rating: Number(v) })}
      />
    </div>
  );
}

/**
 * Filters for /courses. Desktop: inline toolbar. Mobile: categories stay
 * inline, the rest opens in a bottom sheet.
 */
export default function FilterPanel({ filters, categories, onChange, onClear, resultCount }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = countActiveFilters(filters);

  return (
    <div className="space-y-4">
      <CategoryChips categories={categories} value={filters.category} onChange={(category) => onChange({ category })} />

      <div className="flex flex-wrap items-center gap-3 border-y border-line py-3">
        <p className="me-auto text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-ink">{resultCount}</span> {resultCount === 1 ? 'كورس' : 'كورس متاح'}
        </p>

        <div className="hidden w-[30rem] lg:block">
          <FilterFields filters={filters} onChange={onChange} />
        </div>

        <Button variant="secondary" size="sm" className="h-11 lg:hidden" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          الفلاتر
          {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-on-primary">{active}</span>}
        </Button>

        <Select
          label="الترتيب"
          hideLabel
          options={sortOptions}
          value={filters.sort}
          onChange={(sort) => onChange({ sort })}
          className="w-full sm:w-[13.5rem]"
        />

        {active > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
            مسح الفلاتر
          </button>
        )}
      </div>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="فلترة الكورسات" size="sm">
        <FilterFields filters={filters} onChange={onChange} stacked />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClear}>
            مسح الفلاتر
          </Button>
          <Button onClick={() => setSheetOpen(false)}>عرض {resultCount} كورس</Button>
        </div>
      </Modal>
    </div>
  );
}
