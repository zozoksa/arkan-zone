import { describe, expect, it } from 'vitest';
import { countActiveFilters, DEFAULT_FILTERS, filterCourses } from '../courseFilters';
import { discountPercent, formatHours, formatLessons, formatPrice } from '../format';
import { courseProgress, learningStreak, nextLesson } from '../progress';

const course = (over) => ({
  id: '1', title: 'React للمطورين', shortDescription: '', instructor: { name: 'م. أحمد' }, skills: ['React'],
  category: 'programming', level: 'beginner', price: 100, rating: 4.5, ratingCount: 10, students: 50, createdAt: '2026-01-01', ...over,
});

describe('filterCourses', () => {
  const list = [
    course({ id: '1' }),
    course({ id: '2', title: 'التسويق الرقمي', category: 'marketing', price: 0, rating: 4.9, students: 10, skills: ['SEO'] }),
    course({ id: '3', title: 'أمن', level: 'advanced', price: 300, rating: 3.9, students: 99, createdAt: '2026-06-01', skills: [] }),
  ];
  it('searches across title and skills, normalising Arabic letters', () => {
    expect(filterCourses(list, { q: 'react' }).map((c) => c.id)).toEqual(['1']);
    expect(filterCourses(list, { q: 'التسويق' }).map((c) => c.id)).toEqual(['2']);
    expect(filterCourses(list, { q: 'امن' }).map((c) => c.id)).toEqual(['3']);
  });
  it('filters by price, rating, level and category', () => {
    expect(filterCourses(list, { price: 'free' }).map((c) => c.id)).toEqual(['2']);
    expect(filterCourses(list, { rating: 4.5 }).map((c) => c.id).sort()).toEqual(['1', '2']);
    expect(filterCourses(list, { level: 'advanced' }).map((c) => c.id)).toEqual(['3']);
    expect(filterCourses(list, { category: 'marketing' }).map((c) => c.id)).toEqual(['2']);
  });
  it('sorts', () => {
    expect(filterCourses(list, { sort: 'price-desc' }).map((c) => c.id)).toEqual(['3', '1', '2']);
    expect(filterCourses(list, { sort: 'newest' })[0].id).toBe('3');
    expect(filterCourses(list, { sort: 'popular' })[0].id).toBe('3');
  });
  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, level: 'beginner', rating: 4 })).toBe(2);
  });
});

describe('format', () => {
  it('formats prices and Arabic plurals', () => {
    expect(formatPrice(0)).toBe('مجاني');
    expect(formatPrice(1200)).toBe('1,200 ج.م');
    expect(formatHours(2)).toBe('ساعتين');
    expect(formatHours(11)).toBe('11 ساعة');
    expect(formatLessons(1)).toBe('درس واحد');
    expect(formatLessons(5)).toBe('5 دروس');
    expect(discountPercent(750, 1000)).toBe(25);
  });
});

describe('progress', () => {
  const c = { lessons: 4, curriculum: [{ lessons: [{ id: 'a' }, { id: 'b' }] }, { lessons: [{ id: 'c' }, { id: 'd' }] }] };
  it('computes progress and next lesson', () => {
    expect(courseProgress(c, { completedLessons: ['a', 'b'] })).toBe(50);
    expect(nextLesson(c, { completedLessons: ['a', 'b'] }).id).toBe('c');
  });
  it('counts a streak of consecutive days', () => {
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString();
    expect(learningStreak([{ at: day(0) }, { at: day(1) }, { at: day(2) }, { at: day(5) }])).toBe(3);
    expect(learningStreak([{ at: day(3) }])).toBe(0);
  });
});
