import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const SearchBar = forwardRef(function SearchBar(
  { value, onChange, placeholder = 'ابحث عن كورس، مهارة أو مدرب', label = 'البحث في الكورسات', className, size = 'md', ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)} role="search">
      <label className="sr-only" htmlFor={props.id || 'course-search'}>
        {label}
      </label>
      <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={ref}
        id={props.id || 'course-search'}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn('field ps-12 pe-11 [&::-webkit-search-cancel-button]:hidden', size === 'lg' ? 'h-14 text-base' : 'h-11')}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute end-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink"
          aria-label="مسح البحث"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
