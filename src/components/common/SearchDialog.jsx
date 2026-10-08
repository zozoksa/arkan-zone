import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CornerDownLeft, SearchX } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import SearchBar from './SearchBar';
import CourseThumbnail from './CourseThumbnail';
import { getCourses } from '@/services/api';
import { filterCourses } from '@/utils/courseFilters';
import { formatPrice } from '@/utils/format';

const SUGGESTIONS = ['React', 'Python', 'تصميم', 'ذكاء اصطناعي'];

export default function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, [open]);

  const results = useMemo(
    () => (query.trim() ? filterCourses(courses, { q: query }).slice(0, 5) : []),
    [courses, query],
  );

  const submit = (e) => {
    e.preventDefault();
    onClose();
    navigate(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : '/courses');
  };

  return (
    <Modal open={open} onClose={onClose} title="ابحث في الكورسات" size="lg">
      <form onSubmit={submit}>
        <SearchBar id="global-search" value={query} onChange={setQuery} size="lg" data-autofocus />
      </form>

      <div className="mt-5 min-h-40">
        {!query.trim() && (
          <div>
            <p className="mb-3 text-sm text-muted">عمليات بحث شائعة</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && results.length > 0 && (
          <ul className="space-y-1.5">
            {results.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/courses/${course.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sunken"
                >
                  <span className="h-12 w-18 shrink-0 overflow-hidden rounded-lg">
                    <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="sm" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{course.title}</span>
                    <span className="block truncate text-sm text-muted">{course.instructor.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink-soft">{formatPrice(course.price)}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={submit}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-medium text-primary hover:bg-primary-soft"
              >
                عرض كل النتائج لـ «{query.trim()}»
                <CornerDownLeft className="size-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        )}

        {query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center text-muted">
            <SearchX className="mb-3 size-7" aria-hidden="true" />
            <p>مفيش كورسات بتطابق «{query.trim()}»</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
