import CourseCard from './CourseCard';
import { cn } from '@/utils/cn';

/** Responsive course grid. `animateKey` replays the staggered entrance when filters change. */
export default function CourseGrid({ courses, categoryMap = {}, columns = 4, animateKey, className }) {
  const cols = columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <div key={animateKey} className={cn('grid gap-5', cols, className)}>
      {courses.map((course, i) => (
        <CourseCard
          key={course.id}
          course={course}
          categoryName={categoryMap[course.category]?.name}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        />
      ))}
    </div>
  );
}
