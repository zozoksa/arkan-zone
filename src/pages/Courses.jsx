import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import ErrorState from '@/components/common/ErrorState';
import FilterPanel from '@/components/courses/FilterPanel';
import CourseGrid from '@/components/courses/CourseGrid';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { CourseGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DEFAULT_FILTERS, filterCourses } from '@/utils/courseFilters';

const PAGE_SIZE = 8;

/** Filters live in the URL so results are shareable and survive refresh. */
function useFilterParams() {
  const [params, setParams] = useSearchParams();
  const filters = {
    q: params.get('q') ?? DEFAULT_FILTERS.q,
    category: params.get('category') ?? DEFAULT_FILTERS.category,
    level: params.get('level') ?? DEFAULT_FILTERS.level,
    price: params.get('price') ?? DEFAULT_FILTERS.price,
    rating: Number(params.get('rating')) || DEFAULT_FILTERS.rating,
    sort: params.get('sort') ?? DEFAULT_FILTERS.sort,
  };
  const page = Math.max(1, Number(params.get('page')) || 1);

  const write = (next, nextPage = 1) => {
    const out = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value !== '' && String(value) !== String(DEFAULT_FILTERS[key])) out.set(key, value);
    });
    if (nextPage > 1) out.set('page', String(nextPage));
    setParams(out, { replace: true });
  };

  return {
    filters,
    page,
    setFilters: (patch) => write({ ...filters, ...patch }),
    clear: () => write({ ...DEFAULT_FILTERS, q: '' }),
    setPage: (p) => write(filters, p),
  };
}

export default function Courses() {
  usePageMeta('كل الكورسات', 'تصفح كورسات Arkan Zone في البرمجة والتصميم والذكاء الاصطناعي والتسويق، وفلتر حسب المستوى والسعر والتقييم.');
  const { courses, categories, categoryMap, loading, error, reload } = useCatalog();
  const { filters, page, setFilters, clear, setPage } = useFilterParams();
  const topRef = useRef(null);

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const validCategory = filters.category === 'all' || categoryMap[filters.category] || loading;
  const activeFilters = validCategory ? filters : { ...filters, category: 'all' };

  const results = useMemo(
    () => filterCourses(courses, activeFilters, categoryNames),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses, categoryNames, JSON.stringify(activeFilters)],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changePage = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-10 sm:py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">كل الكورسات</h1>
          <p className="mt-3 max-w-xl text-muted">دوّر بالاسم أو المهارة أو اسم المدرب، والنتايج بتتحدث وأنت بتكتب.</p>
          <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} size="lg" className="mt-7 max-w-2xl" />
        </div>
      </section>

      <section className="container-page scroll-mt-20 py-8 sm:py-10" ref={topRef} aria-label="نتائج الكورسات">
        <FilterPanel
          filters={activeFilters}
          categories={categories}
          onChange={setFilters}
          onClear={clear}
          resultCount={loading ? '…' : results.length}
        />

        <div className="mt-8">
          {error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : loading ? (
            <CourseGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="لم نجد كورسات تطابق بحثك"
              description="جرّب كلمات أبسط، أو وسّع الفلاتر عشان تشوف نتايج أكتر."
              action={<Button onClick={clear}>مسح الفلاتر</Button>}
            />
          ) : (
            <>
              <CourseGrid courses={visible} categoryMap={categoryMap} animateKey={`${JSON.stringify(activeFilters)}-${currentPage}`} />
              <Pagination page={currentPage} totalPages={totalPages} onChange={changePage} className="mt-10" />
            </>
          )}
        </div>
      </section>
    </>
  );
}
