import CategoryCard from '@/components/courses/CategoryCard';
import ErrorState from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Categories() {
  usePageMeta('التصنيفات', 'تصفح مجالات التعلم في Arkan Zone: برمجة، تصميم، ذكاء اصطناعي، تسويق، أعمال، لغات، أمن سيبراني ومهارات شخصية.');
  const { categories, loading, error, reload } = useCatalog();
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">التصنيفات</h1>
      <p className="mt-3 max-w-xl text-muted">اختار المجال، وهتلاقي كل الكورسات بتاعته مرتبة حسب المستوى.</p>
      <div className="mt-10">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
              : categories.map((cat) => <CategoryCard key={cat.id} category={cat} detailed />)}
          </div>
        )}
      </div>
    </div>
  );
}
