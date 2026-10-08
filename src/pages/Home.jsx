import Hero from '@/components/home/Hero';
import StatsBand from '@/components/home/StatsBand';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import HowItWorks from '@/components/home/HowItWorks';
import CtaBand from '@/components/home/CtaBand';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Home() {
  usePageMeta(null);
  const { courses, categories, categoryMap, loading, error, reload } = useCatalog();

  return (
    <>
      <Hero />
      <StatsBand />
      <CategoriesSection categories={categories} loading={loading} />
      <FeaturedCourses courses={courses} categoryMap={categoryMap} loading={loading} error={error} onRetry={reload} />
      <HowItWorks />
      <CtaBand />
    </>
  );
}
