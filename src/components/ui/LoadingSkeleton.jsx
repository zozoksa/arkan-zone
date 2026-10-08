import { cn } from '@/utils/cn';

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface" aria-hidden="true">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 8, className }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-4', className)} role="status" aria-label="جاري تحميل الكورسات">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CourseDetailsSkeleton() {
  return (
    <div role="status" aria-label="جاري تحميل الكورس">
      <div className="border-b border-line bg-surface">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
          <div className="space-y-5">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-2/3 max-w-lg" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="جاري تحميل لوحة التحكم">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
