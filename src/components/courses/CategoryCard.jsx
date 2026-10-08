import { Link } from 'react-router-dom';
import CategoryIcon from '@/components/common/CategoryIcon';
import { cn } from '@/utils/cn';

export default function CategoryCard({ category, detailed = false, className }) {
  return (
    <Link
      to={`/courses?category=${category.id}`}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-[border-color,transform,box-shadow] duration-300',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card',
        detailed && 'items-start p-6',
        className,
      )}
    >
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary',
          detailed ? 'size-14' : 'size-12',
        )}
      >
        <CategoryIcon name={category.icon} className={cn('transition-transform duration-300 group-hover:scale-110', detailed ? 'size-6' : 'size-5')} />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-medium text-ink">{category.name}</span>
        <span className="block text-sm text-muted">{category.courseCount} كورس</span>
        {detailed && <span className="mt-2 block text-sm text-ink-soft">{category.description}</span>}
      </span>
    </Link>
  );
}
