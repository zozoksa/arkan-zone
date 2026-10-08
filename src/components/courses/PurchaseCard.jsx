import { Award, Infinity as InfinityIcon, MonitorSmartphone, PlayCircle, FileCheck2 } from 'lucide-react';
import CourseThumbnail from '@/components/common/CourseThumbnail';
import FavoriteButton from '@/components/common/FavoriteButton';
import Button from '@/components/ui/Button';
import { discountPercent, formatHours, formatLessons, formatPrice } from '@/utils/format';

export default function PurchaseCard({ course, enrolled, enrolling, onEnroll, certificate }) {
  const discount = discountPercent(course.price, course.oldPrice);
  const includes = [
    { icon: PlayCircle, text: `${formatLessons(course.lessons)} بمدة ${formatHours(course.duration)}` },
    { icon: FileCheck2, text: 'تمارين ومشاريع عملية' },
    { icon: MonitorSmartphone, text: 'على الموبايل والكمبيوتر' },
    { icon: InfinityIcon, text: 'وصول مدى الحياة' },
    { icon: Award, text: 'شهادة إتمام' },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="aspect-video">
        <CourseThumbnail thumbnail={course.thumbnail} title={course.title} size="lg" />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-3xl font-bold text-ink">{formatPrice(course.price)}</span>
          {course.oldPrice && <span className="text-muted line-through">{formatPrice(course.oldPrice)}</span>}
          {discount > 0 && <span className="text-sm font-semibold text-primary">خصم {discount}%</span>}
        </div>

        <div className="mt-5 grid gap-3">
          {enrolled ? (
            <Button to={`/learn/${course.id}`} size="lg">
              تابع التعلّم
            </Button>
          ) : (
            <Button size="lg" onClick={onEnroll} loading={enrolling}>
              {enrolling ? 'جاري الاشتراك' : course.price > 0 ? 'اشترك الآن' : 'اشترك مجانًا'}
            </Button>
          )}
          {certificate && (
            <Button to={`/certificates/${certificate}`} variant="soft">
              <Award className="size-4" aria-hidden="true" />
              عرض شهادتك
            </Button>
          )}
          <FavoriteButton courseId={course.id} variant="button" />
        </div>
        {!enrolled && course.price > 0 && (
          <p className="mt-3 text-center text-xs text-muted">دفع آمن بالكارت أو المحفظة، وعندك 14 يوم لاسترداد المبلغ</p>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <h2 className="font-sans text-sm font-semibold text-ink">الكورس يشمل</h2>
          <ul className="mt-3 space-y-2.5">
            {includes.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
