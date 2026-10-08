/** Pure filtering/sorting for the course catalogue (used by /courses). */

export const DEFAULT_FILTERS = {
  q: '',
  category: 'all',
  level: 'all',
  price: 'all',
  rating: 0,
  sort: 'popular',
};

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

const sorters = {
  popular: (a, b) => b.students - a.students,
  rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

export function filterCourses(courses, filters, categoryNames = {}) {
  const { q, category, level, price, rating, sort } = { ...DEFAULT_FILTERS, ...filters };
  const query = normalize(q);

  const result = courses.filter((c) => {
    if (category !== 'all' && c.category !== category) return false;
    if (level !== 'all' && c.level !== level) return false;
    if (price === 'free' && c.price > 0) return false;
    if (price === 'paid' && c.price === 0) return false;
    if (rating && c.rating < rating) return false;
    if (query) {
      const haystack = normalize(
        [c.title, c.shortDescription, c.instructor.name, categoryNames[c.category] || '', ...c.skills].join(' '),
      );
      return query.split(/\s+/).every((word) => haystack.includes(word));
    }
    return true;
  });

  return result.sort(sorters[sort] || sorters.popular);
}

export function countActiveFilters(filters) {
  let n = 0;
  if (filters.category !== 'all') n += 1;
  if (filters.level !== 'all') n += 1;
  if (filters.price !== 'all') n += 1;
  if (Number(filters.rating) > 0) n += 1;
  return n;
}
