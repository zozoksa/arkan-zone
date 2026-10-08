import { levels } from '@/data/constants';

export const levelName = (id) => levels.find((l) => l.id === id)?.name || id;

export function courseBadge(course) {
  if (course.bestSeller) return { label: 'الأكثر مبيعًا', tone: 'accent' };
  if (course.isNew) return { label: 'جديد', tone: 'primary' };
  if (course.featured) return { label: 'مميز', tone: 'solid' };
  return null;
}

export const lessonTypeLabel = {
  video: 'فيديو',
  article: 'مقال',
  quiz: 'اختبار',
  project: 'مشروع',
};
