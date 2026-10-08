import SectionHeader from '@/components/common/SectionHeader';
import CategoryCard from '@/components/courses/CategoryCard';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

export default function CategoriesSection({ categories, loading }) {
  return (
    <section className="container-page py-16 lg:py-24" aria-labelledby="categories-title">
      <SectionHeader
        id="categories-title"
        title="اختار المجال اللي يناسبك"
        description="ثمان مجالات مطلوبة في السوق، وكل مجال فيه مسار واضح من البداية للاحتراف."
        action={
          <Button to="/categories" variant="secondary" size="sm">
            كل التصنيفات
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
      </div>
    </section>
  );
}
